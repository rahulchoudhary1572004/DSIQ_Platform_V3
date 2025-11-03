"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronRight, Building2, User, CreditCard, Flag, Target } from "lucide-react"
import { gsap } from "gsap"

const HierarchySidebar = ({ isOpen, onSelectionChange }) => {
  const [expandedItems, setExpandedItems] = useState(new Set(["org-1"]))
  const [selectedItem, setSelectedItem] = useState(null)
  const sidebarRef = useRef(null)

  // Mock data structure - replace with real data
  const hierarchyData = {
    organizations: [
      {
        id: "org-1",
        name: "Acme Corporation",
        users: [
          {
            id: "user-1",
            name: "Amazon User 1",
            accounts: [
              {
                id: "acc-1",
                name: "US Account",
                profiles: [
                  {
                    id: "prof-1",
                    name: "Brand Store US",
                    country: "US",
                    flag: "🇺🇸",
                    campaigns: [
                      { id: "camp-1", name: "Holiday Campaign", type: "SP" },
                      { id: "camp-2", name: "Brand Defense", type: "SB" },
                    ],
                  },
                  {
                    id: "prof-2",
                    name: "Brand Store UK",
                    country: "UK",
                    flag: "🇬🇧",
                    campaigns: [{ id: "camp-3", name: "UK Launch", type: "SD" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const handleItemSelect = (item, type) => {
    setSelectedItem(item.id)
    onSelectionChange && onSelectionChange(item, type)
  }

  const TreeItem = ({ item, type, level = 0, icon: Icon }) => {
    const hasChildren =
      (type === "organization" && item.users?.length) ||
      (type === "user" && item.accounts?.length) ||
      (type === "account" && item.profiles?.length) ||
      (type === "profile" && item.campaigns?.length)

    const isExpanded = expandedItems.has(item.id)
    const isSelected = selectedItem === item.id

    return (
      <div className="select-none">
        <div
          className={`flex items-center py-2 px-2 cursor-pointer hover:bg-gray-50 rounded-md transition-colors duration-150 ${
            isSelected ? "bg-blue-50 border-l-2 border-blue-500" : ""
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => handleItemSelect(item, type)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(item.id)
              }}
              className="mr-1 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}

          {!hasChildren && <div className="w-6" />}

          <Icon size={14} className="mr-2 text-gray-600" />

          <span className="text-sm font-medium text-gray-700 truncate">{item.name}</span>

          {type === "profile" && <span className="ml-2 text-xs">{item.flag}</span>}

          {type === "campaign" && <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded">{item.type}</span>}
        </div>

        {hasChildren && isExpanded && (
          <div className="transition-all duration-200 ease-in-out">
            {type === "organization" &&
              item.users?.map((user) => (
                <TreeItem key={user.id} item={user} type="user" level={level + 1} icon={User} />
              ))}
            {type === "user" &&
              item.accounts?.map((account) => (
                <TreeItem key={account.id} item={account} type="account" level={level + 1} icon={CreditCard} />
              ))}
            {type === "account" &&
              item.profiles?.map((profile) => (
                <TreeItem key={profile.id} item={profile} type="profile" level={level + 1} icon={Flag} />
              ))}
            {type === "profile" &&
              item.campaigns?.map((campaign) => (
                <TreeItem key={campaign.id} item={campaign} type="campaign" level={level + 1} icon={Target} />
              ))}
          </div>
        )}
      </div>
    )
  }

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.3, ease: "power2.out" },
      )
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div ref={sidebarRef} className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Account Hierarchy</h3>
      </div>

      <div className="p-2">
        {hierarchyData.organizations.map((org) => (
          <TreeItem key={org.id} item={org} type="organization" level={0} icon={Building2} />
        ))}
      </div>
    </div>
  )
}

export default HierarchySidebar
