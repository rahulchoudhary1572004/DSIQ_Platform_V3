"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import ViewConfigurator from "../../components/PIM/views/ViewConfigurator"
import { useProductData } from "../../context/ProductDataContext"
import { useViewTemplates, useViewTemplateOperations, ENV } from "../../api/pim"

const ViewConfigurationPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const { picklistOptions, setPicklistOptions, fieldMappingTemplates } = useProductData()
  
  // Use real API hooks
  const { templates: viewTemplates, loading, fetchTemplates, setTemplates: setViewTemplates } = useViewTemplates(ENV.ORG_ID)
  const { create, update } = useViewTemplateOperations(ENV.ORG_ID)

  // Fetch view templates on component mount
  useEffect(() => {
    const newTemplate = (location.state as any)?.newTemplate
    
    if (newTemplate) {
      // If we have a new template from navigation state, add it to the list
      setViewTemplates(prev => {
        // Check if it already exists
        const exists = prev.find(t => t.id === newTemplate.id)
        if (exists) return prev
        return [...prev, newTemplate]
      })
    } else {
      // Otherwise fetch from API
      fetchTemplates()
    }
  }, [])

  // Normalize field type to proper case
  const normalizeFieldType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'TEXT': 'Text',
      'NUMBER': 'Number',
      'BOOLEAN': 'Boolean',
      'DATE': 'Date',
      'LONG TEXT': 'Long Text',
      'LONGTEXT': 'Long Text',
      'RICH TEXT': 'Rich Text',
      'RICHTEXT': 'Rich Text',
      'DROPDOWN': 'Dropdown',
      'PICKLIST': 'Dropdown',
      'STRING': 'Text',
    }
    
    const upperType = type.toUpperCase()
    return typeMap[upperType] || type
  }

  const handleSave = async (deletionData?: { deletedSectionIds: string[], deletedAttributes: Array<{ id: string, section_id: string }> }) => {
    try {
      // Find the current view template
      const currentView = viewTemplates.find(v => v.id === id)
      if (!currentView) {
        alert("View not found!")
        return
      }

      // Format sections and attributes for API (include IDs for update, ensure order exists)
      const formattedSections = currentView.sections?.map((section, sectionIndex) => {
        const formattedSection: any = {
          title: section.title,
          order: section.order ?? sectionIndex,
          attributes: section.attributes.map((attr, attrIndex) => {
            const formattedAttr: any = {
              name: attr.name,
              type: normalizeFieldType(attr.type), // Normalize type to proper case
              required: attr.required,
              order: attr.order ?? attrIndex,
            }
            
            // Include ID if it exists and is a string (real ID, not temp numeric)
            if (attr.id && typeof attr.id === 'string') {
              formattedAttr.id = attr.id
            }
            
            // For Dropdown type, options is required (even if empty)
            if (attr.type === 'Dropdown') {
              formattedAttr.options = attr.options && attr.options.length > 0 ? attr.options : []
            } else if (attr.options && attr.options.length > 0) {
              // For other types, only include options if they exist
              formattedAttr.options = attr.options
            }
            
            return formattedAttr
          })
        }
        
        // Include section ID if it exists and is a string (real ID, not temp numeric)
        if (section.id && typeof section.id === 'string') {
          formattedSection.id = section.id
        }
        
        return formattedSection
      }) || []

      // Check if this is a new template (has _isNew flag or temp ID)
      const isNewTemplate = (currentView as any)._isNew || id?.startsWith('temp-')

      if (isNewTemplate) {
        // Create new view template (remove IDs for create, no delete_data needed)
        const createSections = formattedSections.map(section => {
          const { id: sectionId, ...sectionWithoutId } = section
          return {
            ...sectionWithoutId,
            attributes: section.attributes.map(attr => {
              const { id: attrId, ...attrWithoutId } = attr
              return attrWithoutId
            })
          }
        })
        
        await create({
          name: currentView.name,
          sections: createSections
        })
      } else {
        // Update existing view template with delete_data (keep IDs for update)
        const updatePayload: any = {
          template_id: currentView.id,
          delete_full: false,
          update_data: {
            name: currentView.name,
            sections: formattedSections
          }
        }
        
        // Add delete_data if there are deletions
        if (deletionData && (deletionData.deletedSectionIds.length > 0 || deletionData.deletedAttributes.length > 0)) {
          updatePayload.delete_data = {
            section_ids: deletionData.deletedSectionIds,
            attributes: deletionData.deletedAttributes
          }
        }
        
        await update(updatePayload)
      }

      alert("View configuration saved successfully!")
      navigate("/pim/views")
    } catch (error) {
      console.error("Error saving view configuration:", error)
      alert("Failed to save view configuration")
    }
  }

  const handleBack = () => {
    navigate("/pim/products")
  }

  // Check if view template exists
  const currentView = viewTemplates.find(v => v.id === id)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading view configuration...</div>
      </div>
    )
  }

  // Show error if view not found after loading
  if (!loading && !currentView) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">View template not found</div>
          <button
            onClick={() => navigate("/pim/views")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Views
          </button>
        </div>
      </div>
    )
  }

  return (
    <ViewConfigurator
      viewTemplates={viewTemplates}
      setViewTemplates={setViewTemplates}
      activeViewId={id || "default"}
      picklistOptions={picklistOptions}
      setPicklistOptions={setPicklistOptions}
      fieldMappingTemplates={fieldMappingTemplates}
      onSave={handleSave}
      onBack={handleBack}
    />
  )
}

export default ViewConfigurationPage
