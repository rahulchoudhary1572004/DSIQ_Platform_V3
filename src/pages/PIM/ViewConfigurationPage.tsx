"use client"

import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import ViewConfigurator from "../../components/PIM/views/ViewConfigurator"
import { useProductData } from "../../context/ProductDataContext"

const ViewConfigurationPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { viewTemplates, setViewTemplates, picklistOptions, setPicklistOptions, fieldMappingTemplates } = useProductData()


  const handleSave = () => {
    console.log("Saving view configuration")
    alert("View configuration saved successfully!")
      navigate("/pim/views")
  }

  const handleBack = () => {
      navigate("/pim/products")
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
