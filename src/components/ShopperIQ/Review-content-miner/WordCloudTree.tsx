"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useSelector } from "react-redux"
import * as d3 from "d3"
import cloud from "d3-cloud"
import api from "../../../api/axios"

const WordCloudTree = ({
  selectedWord,
  setSelectedWord,
  filters,
  treeData,
  setTreeData,
  isFullscreen = false,
  toggleFullscreen,
}) => {
  const svgRef = useRef(null)
  const tooltipRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 })
  const [hoveredWord, setHoveredWord] = useState(null)
  const [treeDimensions, setTreeDimensions] = useState({ width: 600, height: 450 })
  const [wordCloudDimensions, setWordCloudDimensions] = useState({ width: 600, height: 300 })
  const [frequencyLimit, setFrequencyLimit] = useState(0)
  const [minSize, setMinSize] = useState(0)
  const [cloudWords, setCloudWords] = useState([])
  const [wordData, setWordData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const resizeTimeoutRef = useRef(null)

  const currentWorkspace = useSelector((state) => state.workspaceView.currentWorkspace)

  const WORD_COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6366F1",
  ]

  const STYLING = {
    fontFamily: "Inter, system-ui, sans-serif",
    tooltipBackground: "rgba(255, 255, 255, 0.98)",
    tooltipBorder: "1px solid rgba(0, 0, 0, 0.1)",
    tooltipShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    tooltipPadding: "8px 12px",
    tooltipRadius: "6px",
    tooltipFontSize: "13px",
    tooltipZIndex: "1000",
    // FIXED: Made tree links much more visible
    treeLinkStroke: "#94a3b8", // Medium gray - visible but not overpowering
    treeNodeFill: "#3b82f6",
    treeNodeStroke: "#ffffff",
    treeNodeTextFill: "#1f2937",
    treeNodeHoverFill: "#2563eb",
  }

  const positionTooltip = (event, tooltip) => {
    if (!tooltip || !containerRef.current) return
    const tooltipRect = tooltip.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    let x = event.clientX - containerRect.left + 15
    let y = event.clientY - containerRect.top - tooltipRect.height - 8

    if (x < 0) x = 8
    if (x + tooltipRect.width > containerRect.width) {
      x = containerRect.width - tooltipRect.width - 8
    }
    if (y < 0) y = event.clientY - containerRect.top + 15
    if (y + tooltipRect.height > containerRect.height) {
      y = containerRect.height - tooltipRect.height - 8
    }

    tooltip.style.left = `${x}px`
    tooltip.style.top = `${y}px`
  }

  const generateWordCloudLayout = useCallback((words, width, isFullscreen, callback) => {
    if (!words.length) {
      callback([])
      return
    }
    const maxSize = Math.max(...words.map((w) => w.size))
    const baseHeight = isFullscreen ? window.innerHeight - 120 : 380
    const margin = 15

    const cloudData = words.map((word, i) => ({
      text: word.text,
      size: Math.max(12, Math.min((word.size / maxSize) * (isFullscreen ? 80 : 40) + 12, isFullscreen ? 100 : 50)),
      originalSize: word.size,
      color: WORD_COLORS[i % WORD_COLORS.length],
      index: i,
    }))

    cloud()
      .size([width - margin * 2, baseHeight - margin * 2])
      .words(cloudData)
      .padding(6)
      .rotate(0)
      .font(STYLING.fontFamily)
      .fontSize((d) => d.size)
      .on("end", (words) => {
        const maxY = words.length > 0 ? Math.max(...words.map((w) => Math.abs(w.y) + w.size / 2)) : 0
        const requiredHeight = Math.max(baseHeight, maxY * 2 + margin * 2)
        callback(words, requiredHeight)
      })
      .start()
  }, [])

  const getProcessedWordData = useCallback(() => {
    let processedData = wordData.filter((word) => word.size > minSize)
    processedData = processedData.sort((a, b) => b.size - a.size)
    if (frequencyLimit > 0) {
      processedData = processedData.slice(0, frequencyLimit)
    }
    return processedData
  }, [wordData, minSize, frequencyLimit])

  const cachedWordCloud = useMemo(() => {
    if (selectedWord) return null
    const words = getProcessedWordData()
    return { words, width: dimensions.width, isFullscreen }
  }, [selectedWord, getProcessedWordData, dimensions.width, isFullscreen])

  // Replace the existing expandedNodes state initialization
  // const [expandedNodes, setExpandedNodes] = useState(new Set())

  // With this new approach that creates unique node IDs
  const createNodeId = (word, path = []) => {
    return [...path, word].join("->")
  }

  const [expandedNodes, setExpandedNodes] = useState(new Set())

  // Calculate tree node count for better spacing
  const calculateTreeNodeCount = useCallback(
    (data, path = []) => {
      if (!data) return 0
      let count = 1
      const nodeId = createNodeId(data.word, path)
      if (data.children && expandedNodes.has(nodeId)) {
        data.children.forEach((child) => {
          count += calculateTreeNodeCount(child, [...path, data.word])
        })
      }
      return count
    },
    [expandedNodes],
  )

  const calculateTreeDepth = useCallback(
    (data, path = []) => {
      if (!data) return 0
      if (!data.children || data.children.length === 0) return 1
      let maxDepth = 0
      const nodeId = createNodeId(data.word, path)
      if (expandedNodes.has(nodeId)) {
        data.children.forEach((child) => {
          maxDepth = Math.max(maxDepth, calculateTreeDepth(child, [...path, data.word]))
        })
      }
      return 1 + maxDepth
    },
    [expandedNodes],
  )

  const fetchTreeData = async (rootWord) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const retailerIds =
        currentWorkspace?.settings
          ?.flatMap((setting) => {
            const retailer = setting.retailer || {}
            return retailer.retailer_id || retailer.id || []
          })
          ?.filter(Boolean) || []

      if (!retailerIds.length) {
        console.warn("No retailer IDs found")
        setTreeData(null)
        setIsLoading(false)
        setErrorMessage("No retailer IDs found")
        return
      }

      const payload = { retailer_id: retailerIds, root_word: rootWord || selectedWord }
      if (filters?.productTitle) {
        payload.product_id = filters.productTitle
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      }
      if (filters?.dateRange) {
        const start = new Date(filters.dateRange.start)
        const end = new Date(filters.dateRange.end)
        if (start && end && !isNaN(start) && !isNaN(end)) {
          payload.review_date_range = {
            start: start.toISOString().split("T")[0],
            end: end.toISOString().split("T")[0],
          }
        }
      }
      if (filters?.rating && (filters.rating.min !== 1 || filters.rating.max !== 5)) {
        const min = Number(filters.rating.min)
        const max = Number(filters.rating.max)
        if (!isNaN(min) && !isNaN(max) && min <= max) {
          payload.review_rating_range = { min, max }
        }
      }

      const response = await api.post("/get_tree_data", payload, { timeout: 30000 })

      if (!response.data.tree || typeof response.data.tree !== "object" || !response.data.tree.word) {
        setErrorMessage("Invalid tree data received")
        setTreeData(null)
        setIsLoading(false)
        return
      }

      setTreeData(response.data.tree)
      // In fetchTreeData, replace this line:
      // setExpandedNodes(new Set([rootWord || selectedWord]))

      // With:
      setExpandedNodes(new Set([createNodeId(rootWord || selectedWord, [])]))
      setIsLoading(false)
      setInitialLoad(false)
    } catch (error) {
      console.error("Tree data fetch error:", error.message)
      setErrorMessage("Failed to fetch tree data")
      setTreeData(null)
      setIsLoading(false)
      setInitialLoad(false)
    }
  }

  const calculateTreeDimensions = useCallback(() => {
    if (!containerRef.current) return { width: 1200, height: 800 }
    const containerWidth = isFullscreen ? window.innerWidth - 20 : Math.max(1200, containerRef.current.clientWidth)
    const containerHeight = isFullscreen ? window.innerHeight - 120 : Math.max(800, containerRef.current.clientHeight)
    return { width: containerWidth, height: containerHeight }
  }, [isFullscreen])

  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    resizeTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const containerWidth = isFullscreen ? window.innerWidth - 20 : containerRef.current.clientWidth
        const containerHeight = isFullscreen ? window.innerHeight - 120 : 420
        setDimensions({ width: containerWidth, height: containerHeight })
        setTreeDimensions(calculateTreeDimensions())
      }
    }, 150)
  }, [isFullscreen, calculateTreeDimensions])

  useEffect(() => {
    const fetchWordCloudData = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      if (!currentWorkspace?.settings) {
        setWordData([])
        setIsLoading(false)
        setErrorMessage("No workspace settings found")
        return
      }

      try {
        const retailerIds =
          currentWorkspace?.settings
            ?.flatMap((setting) => {
              const retailer = setting.retailer || {}
              return retailer.retailer_id || retailer.id || []
            })
            ?.filter(Boolean) || []

        if (!retailerIds.length) {
          setWordData([])
          setIsLoading(false)
          setErrorMessage("No retailer IDs found")
          return
        }

        const payload = { retailer_id: retailerIds }
        if (filters?.productTitle) {
          payload.product_id = filters.productTitle
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        }
        if (filters?.dateRange) {
          const start = new Date(filters.dateRange.start)
          const end = new Date(filters.dateRange.end)
          if (start && end && !isNaN(start) && !isNaN(end)) {
            payload.review_date_range = {
              start: start.toISOString().split("T")[0],
              end: end.toISOString().split("T")[0],
            }
          }
        }
        if (filters?.rating && (filters.rating.min !== 1 || filters.rating.max !== 5)) {
          const min = Number(filters.rating.min)
          const max = Number(filters.rating.max)
          if (!isNaN(min) && !isNaN(max) && min <= max) {
            payload.review_rating_range = { min, max }
          }
        }

        const response = await api.post("/generate_word_cloud", payload)
        const apiData = response.data.word_cloud_data

        if (!apiData || !Array.isArray(apiData)) {
          setWordData([])
          setIsLoading(false)
          setErrorMessage("Invalid word cloud data received")
          return
        }

        const transformedData = apiData.map((item) => ({
          text: item.word,
          size: item.frequency,
        }))
        setWordData(transformedData)
        setIsLoading(false)
      } catch (error) {
        console.error("Word cloud fetch error:", error.message)
        setWordData([])
        setErrorMessage("Failed to fetch word cloud data")
        setIsLoading(false)
      }
    }

    fetchWordCloudData()
  }, [currentWorkspace, filters])

  useEffect(() => {
    if (selectedWord) {
      fetchTreeData(selectedWord)
    } else {
      setTreeData(null)
      setIsLoading(false)
      setErrorMessage(null)
      setExpandedNodes(new Set())
      setInitialLoad(true)
    }
  }, [selectedWord, filters])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current)
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [handleResize])

  useEffect(() => {
    if (!cachedWordCloud) return
    const { words, width, isFullscreen } = cachedWordCloud
    generateWordCloudLayout(words, width, isFullscreen, (layoutWords, requiredHeight) => {
      setCloudWords(layoutWords)
      setWordCloudDimensions({ width, height: requiredHeight })
    })
  }, [cachedWordCloud, generateWordCloudLayout])

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = selectedWord ? treeDimensions.width : wordCloudDimensions.width
    const height = selectedWord ? treeDimensions.height : wordCloudDimensions.height
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")

    if (!selectedWord) {
      const contentGroup = svg
        .append("g")
        .attr("transform", `translate(${wordCloudDimensions.width / 2},${wordCloudDimensions.height / 2})`)

      const wordGroups = contentGroup
        .selectAll(".word")
        .data(cloudWords)
        .enter()
        .append("g")
        .attr("class", "word")
        .attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.rotate || 0})`)

      wordGroups
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("font-family", STYLING.fontFamily)
        .style("fill", (d) => d.color)
        .style("cursor", "pointer")
        .style("font-weight", "600")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .text((d) => d.text)
        .on("mouseover", (event, d) => {
          if (!selectedWord) {
            setHoveredWord(d.text)
            const tooltip = d3.select(tooltipRef.current)
            tooltip.style("opacity", 1).html(`<strong>${d.text}</strong><br/>Frequency: ${d.originalSize}`)
            positionTooltip(event, tooltip.node())
          }
        })
        .on("mouseout", () => {
          if (!selectedWord) {
            setHoveredWord(null)
            d3.select(tooltipRef.current).style("opacity", 0)
          }
        })
        .on("click", (event, d) => {
          d3.select(tooltipRef.current).style("opacity", 0)
          setHoveredWord(null)
          setSelectedWord(d.text)
        })
    } else {
      if (isLoading || initialLoad) {
        const contentGroup = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`)
        contentGroup
          .append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-family", STYLING.fontFamily)
          .style("fill", STYLING.treeNodeTextFill)
          .style("font-size", "16px")
          .text("Loading tree data...")
        return
      }

      if (errorMessage) {
        const contentGroup = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`)
        contentGroup
          .append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-family", STYLING.fontFamily)
          .style("fill", "#ef4444")
          .style("font-size", "16px")
          .text(errorMessage)
        return
      }

      if (!treeData || !treeData.word) {
        const contentGroup = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`)
        contentGroup
          .append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-family", STYLING.fontFamily)
          .style("fill", "#ef4444")
          .style("font-size", "16px")
          .text("No tree data available")
        return
      }

      try {
        // Update the createFilteredHierarchy function to use unique node IDs
        const createFilteredHierarchy = (data, expanded, path = []) => {
          const nodeId = createNodeId(data.word || selectedWord, path)
          const copy = { ...data, nodeId, children: [] }

          if (data.children && expanded.has(nodeId)) {
            copy.children = data.children.map((child, index) =>
              createFilteredHierarchy(child, expanded, [...path, data.word || selectedWord]),
            )
          }
          return copy
        }

        const filteredData = createFilteredHierarchy(treeData, expandedNodes)
        const nodeCount = calculateTreeNodeCount(filteredData)

        // Calculate tree depth for better width calculation
        const calculateTreeDepth = (node) => {
          if (!node.children || node.children.length === 0) return 1
          return 1 + Math.max(...node.children.map(calculateTreeDepth))
        }

        const treeDepth = calculateTreeDepth(filteredData)

        // Improved tree layout with dynamic sizing
        const margin = { top: 80, right: 150, bottom: 60, left: 200 } // Increased left margin
        const minTreeWidth = Math.max(1400, treeDepth * 350) // Increased from 300px per level
        const minTreeHeight = Math.max(1000, nodeCount * 80) // Increased from 70px per node

        const treeWidth = Math.max(width - margin.left - margin.right, minTreeWidth)
        const treeHeight = Math.max(height - margin.top - margin.bottom, minTreeHeight)

        // Update SVG dimensions to accommodate the full tree
        const totalWidth = treeWidth + margin.left + margin.right
        const totalHeight = treeHeight + margin.top + margin.bottom

        svg
          .attr("width", totalWidth)
          .attr("height", totalHeight)
          .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
          .attr("preserveAspectRatio", "xMinYMin meet")

        const tree = d3
          .tree()
          .size([treeHeight, treeWidth])
          .separation((a, b) => {
            // Even more spacing for much larger text at all levels
            const baseSpacing = a.parent === b.parent ? 3.0 : 4.0 // Increased from 2.5/3.5
            const depthFactor = Math.max(1, a.depth * 0.5) // Increased factor
            return baseSpacing * depthFactor
          })

        const root = d3.hierarchy(filteredData, (d) => d.children)
        tree(root)

        // Create main group with proper margins
        const contentGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)

        // FIXED: Add links with much more visible styling
        const links = contentGroup
          .selectAll(".link")
          .data(root.links())
          .enter()
          .append("path")
          .attr("class", "link")
          .attr(
            "d",
            d3
              .linkHorizontal()
              .x((d) => d.y)
              .y((d) => d.x),
          )
          .attr("fill", "none")
          .attr("stroke", STYLING.treeLinkStroke) // Now using darker color
          .attr("stroke-width", 2) // FIXED: Increased from 2 to 3 for better visibility
          .style("stroke-opacity", 0.8) // FIXED: Changed from 0.6 to 1 for full opacity
          .style("transition", "all 0.3s ease")

        // Add nodes with improved positioning
        const nodes = contentGroup
          .selectAll(".node")
          .data(root.descendants())
          .enter()
          .append("g")
          .attr("class", "node")
          .attr("transform", (d) => `translate(${d.y}, ${d.x})`)
          .style("cursor", "pointer")

        // In the nodes.on("click", ...) handler, replace the entire function with:
        nodes.on("click", (event, d) => {
          event.stopPropagation()

          // Create unique node ID based on the path from root to this node
          const getNodePath = (node) => {
            const path = []
            let current = node
            while (current.parent) {
              path.unshift(current.parent.data.word || selectedWord)
              current = current.parent
            }
            return path
          }

          const nodePath = getNodePath(d)
          const nodeId = createNodeId(d.data.word || selectedWord, nodePath)
          const newExpanded = new Set(expandedNodes)

          if (newExpanded.has(nodeId)) {
            // Collapse this specific node and its descendants
            const removeDescendants = (node, currentPath) => {
              const currentNodeId = createNodeId(node.word || selectedWord, currentPath)
              newExpanded.delete(currentNodeId)
              if (node.children) {
                node.children.forEach((child) => {
                  removeDescendants(child, [...currentPath, node.word || selectedWord])
                })
              }
            }
            removeDescendants(d.data, nodePath)
            setExpandedNodes(newExpanded)
          } else {
            // Expand this specific node
            newExpanded.add(nodeId)
            setExpandedNodes(newExpanded)
          }
        })

        // Add circles for nodes
        nodes
          .append("circle")
          .attr("r", (d) => (d.depth === 0 ? 12 : 8))
          // In the circle fill logic, replace:
          // .attr("fill", (d) => {
          //   if (d.depth === 0) return "#10b981"
          //   return expandedNodes.has(d.data.word) ? "#f59e0b" : STYLING.treeNodeFill
          // })
          .attr("fill", (d) => {
            if (d.depth === 0) return "#10b981"

            const getNodePath = (node) => {
              const path = []
              let current = node
              while (current.parent) {
                path.unshift(current.parent.data.word || selectedWord)
                current = current.parent
              }
              return path
            }

            const nodePath = getNodePath(d)
            const nodeId = createNodeId(d.data.word || selectedWord, nodePath)
            return expandedNodes.has(nodeId) ? "#f59e0b" : STYLING.treeNodeFill
          })
          .attr("stroke", STYLING.treeNodeStroke)
          .attr("stroke-width", 2)
          .style("transition", "all 0.3s ease")
          .on("mouseover", function (event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("fill", STYLING.treeNodeHoverFill)
              .attr("r", d.depth === 0 ? 14 : 10)
          })
          .on("mouseout", function (event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("fill", (d) => {
                if (d.depth === 0) return "#10b981"
                return expandedNodes.has(d.data.word) ? "#f59e0b" : STYLING.treeNodeFill
              })
              .attr("r", d.depth === 0 ? 12 : 8)
          })

        // FIXED: Add text labels with improved positioning and better visibility
        nodes
          .append("text")
          .attr("dy", "0.35em")
          .attr("x", (d) => {
            // FIXED: Better text positioning to ensure full visibility
            const hasChildren = d.children || (d.data.children && d.data.children.length > 0)
            if (d.depth === 0) return -35 // Root node text further to the left
            return hasChildren ? -25 : 25 // Parent nodes to left, leaf nodes to right, with more spacing
          })
          .attr("text-anchor", (d) => {
            const hasChildren = d.children || (d.data.children && d.data.children.length > 0)
            if (d.depth === 0) return "end"
            return hasChildren ? "end" : "start"
          })
          .style("fill", STYLING.treeNodeTextFill)
          .style("font-size", (d) => {
            // MUCH larger font sizes for ALL levels - dramatically increased
            if (d.depth === 0) return "32px" // Root node - extra extra large
            if (d.depth === 1) return "28px" // First level - extra large
            if (d.depth === 2) return "26px" // Second level - very large
            if (d.depth === 3) return "24px" // Third level - large
            return "22px" // All deeper levels - still very large and readable
          })
          .style("font-weight", (d) => {
            if (d.depth === 0) return "800" // Root node - extra bold
            if (d.depth === 1) return "700" // First level - bold
            return "600" // Other levels - semi-bold
          })
          .style("font-family", STYLING.fontFamily)
          .style("pointer-events", "none")
          .style("letter-spacing", "0.5px") // Better readability
          .style("text-shadow", "0 1px 2px rgba(255,255,255,0.8)") // Subtle shadow for better contrast
          .text((d) => d.data.word || selectedWord)
          .each(function (d) {
            // FIXED: Improved text handling to ensure full visibility
            const text = d3.select(this)
            const wordText = d.data.word || selectedWord

            // Ensure text is fully visible - don't truncate unless absolutely necessary
            if (wordText.length > 20) {
              // Only truncate extremely long words
              const maxLength = d.depth === 0 ? 25 : 20
              if (wordText.length > maxLength) {
                const truncated = wordText.substring(0, maxLength) + "..."
                text.text(truncated)
                // Add title attribute for full text on hover
                text.append("title").text(wordText)
              }
            }
          })

        // FIXED: Add expand/collapse indicators positioned ABOVE the text
        nodes
          .filter((d) => d.data.children && d.data.children.length > 0)
          .append("circle")
          .attr("r", 8) // Slightly larger
          .attr("cx", (d) => {
            // Position horizontally based on text position
            const hasChildren = d.children || (d.data.children && d.data.children.length > 0)
            if (d.depth === 0) return -35 // Match root text position (was -25)
            return hasChildren ? -25 : 25 // Match parent/leaf text positions (was -20/20)
          })
          .attr("cy", -25) // FIXED: Position ABOVE the text (negative Y value)
          .attr("fill", "#ffffff")
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 2)
          .style("cursor", "pointer")
          .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.1))")

        // FIXED: Position the +/- text indicators above the words
        nodes
          .filter((d) => d.data.children && d.data.children.length > 0)
          .append("text")
          .attr("x", (d) => {
            // Match the circle position
            const hasChildren = d.children || (d.data.children && d.data.children.length > 0)
            if (d.depth === 0) return -35
            return hasChildren ? -25 : 25 // Match circle position
          })
          .attr("y", -25) // FIXED: Position ABOVE the text (same as circle)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .style("font-size", "14px") // Larger font for indicators (was 12px)
          .style("font-weight", "bold")
          .style("fill", "#3b82f6")
          .style("pointer-events", "none")
          // In the expand/collapse indicator text, replace:
          // .text((d) => (expandedNodes.has(d.data.word) ? "−" : "+"))
          .text((d) => {
            const getNodePath = (node) => {
              const path = []
              let current = node
              while (current.parent) {
                path.unshift(current.parent.data.word || selectedWord)
                current = current.parent
              }
              return path
            }

            const nodePath = getNodePath(d)
            const nodeId = createNodeId(d.data.word || selectedWord, nodePath)
            return expandedNodes.has(nodeId) ? "−" : "+"
          })
      } catch (error) {
        console.error("Tree rendering error:", error)
        const contentGroup = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`)
        contentGroup
          .append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-family", STYLING.fontFamily)
          .style("fill", "#ef4444")
          .style("font-size", "16px")
          .text("Error rendering tree")
      }
    }
  }, [
    selectedWord,
    treeData,
    treeDimensions,
    cloudWords,
    wordCloudDimensions,
    isFullscreen,
    isLoading,
    errorMessage,
    expandedNodes,
    initialLoad,
    calculateTreeNodeCount,
  ])

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-gray-50 gap-2 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {!selectedWord && (
            <div className="flex items-center gap-2 flex-wrap">
              <label htmlFor="frequencyLimit" className="text-xs sm:text-sm font-medium whitespace-nowrap">
                Frequency Limit:
              </label>
              <input
                id="frequencyLimit"
                type="number"
                min="0"
                max="100"
                step="1"
                value={frequencyLimit}
                onChange={(e) => setFrequencyLimit(Number(e.target.value))}
                className="w-16 sm:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          {selectedWord && (
            <button
              onClick={() => {
                setSelectedWord(null)
                setTreeData(null)
                setErrorMessage(null)
                setExpandedNodes(new Set())
                setInitialLoad(true)
              }}
              className="px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-all duration-200"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Word Cloud</span>
              <span className="sm:hidden">Back</span>
            </button>
          )}
        </div>
        {toggleFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded self-end sm:self-auto transition-all duration-200"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isFullscreen
                    ? "M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"
                    : "M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                }
              />
            </svg>
          </button>
        )}
      </div>
      <div ref={containerRef} className="flex-1 relative bg-white overflow-auto">
        {isLoading && !selectedWord ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm sm:text-base">Loading Word Cloud...</span>
            </div>
          </div>
        ) : wordData.length === 0 && !selectedWord ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm sm:text-base">
            No words to display
          </div>
        ) : (
          <div
            className="relative"
            style={{
              minWidth: selectedWord ? `${Math.max(treeDimensions.width, 1200)}px` : "auto",
              minHeight: selectedWord ? `${Math.max(treeDimensions.height, 800)}px` : "auto",
            }}
          >
            <svg
              ref={svgRef}
              className="block"
              style={{
                width: selectedWord ? `${Math.max(treeDimensions.width, 1200)}px` : "100%",
                height: selectedWord ? `${Math.max(treeDimensions.height, 800)}px` : "100%",
                minHeight: "350px",
              }}
            />
            <div
              ref={tooltipRef}
              className="absolute opacity-0 pointer-events-none z-50 bg-white border border-gray-200 rounded shadow-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium transition-opacity"
              style={{
                background: STYLING.tooltipBackground,
                border: STYLING.tooltipBorder,
                boxShadow: STYLING.tooltipShadow,
                borderRadius: STYLING.tooltipRadius,
                fontSize: STYLING.tooltipFontSize,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default WordCloudTree
