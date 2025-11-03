"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import ProductEditor from "../../components/PIM/product/ProductEditor"
import { useProductData } from "../../context/ProductDataContext"

const CreateProductPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { viewTemplates, picklistOptions } = useProductData()

  const viewTemplate = searchParams.get("view") || "default"

  const handleSave = (productData) => {
    console.log("Creating new product:", productData)
    alert("Product created successfully!")
    navigate("/pim/products")
  }

  const handleCancel = () => {
    navigate("/pim/products")
  }

  const handleConfigure = () => {
    navigate(`/pim/views/${viewTemplate}/?returnTo=/products/new`)
  }

  return (
    <ProductEditor
      viewTemplates={viewTemplates}
      productData={{}}
      picklistOptions={picklistOptions}
      activeViewId={viewTemplate}
      onSave={handleSave}
      onCancel={handleCancel}
      onConfigure={handleConfigure}
      isEditMode={true}
      onShowVersionHistory={() => {}}
      productId={null}
      pageTitle="Create New Product"
    />
  )
}

export default CreateProductPage
