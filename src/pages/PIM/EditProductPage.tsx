import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import ProductEditor from "../../components/PIM/product/ProductEditor"
import { useProductData } from "../../context/ProductDataContext"
import { useState } from "react"
import ProductVersionHistory from "../../components/PIM/product/ProductVersionHistory"

const EditProductPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { viewTemplates, productData, picklistOptions } = useProductData()
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  const viewTemplate = searchParams.get("view") || "default"

  const handleSave = (updatedProductData) => {
    console.log("Saving product changes:", updatedProductData)
    alert("Product updated successfully!")
    navigate(`/products/${id}`)
  }

  const handleCancel = () => {
    navigate(`/pim/products/${id}`)
  }

  const handleConfigure = () => {
    navigate(`/pim/views/${viewTemplate}?returnTo=/products/${id}/edit`)
  }

  const handleShowVersionHistory = () => setShowVersionHistory(true)
  const handleCloseVersionHistory = () => setShowVersionHistory(false)

  if (showVersionHistory) {
    return (
      <ProductVersionHistory
        product={productData}
        onClose={handleCloseVersionHistory}
        onRestore={(version) => {
          // TODO: Implement restore logic
          setShowVersionHistory(false)
        }}
      />
    )
  }

  return (
    <ProductEditor
      viewTemplates={viewTemplates}
      productData={productData}
      picklistOptions={picklistOptions}
      activeViewId={viewTemplate}
      onSave={handleSave}
      onCancel={handleCancel}
      onConfigure={handleConfigure}
      isEditMode={true}
      productId={id || ""}
      pageTitle="Edit Product"
      onShowVersionHistory={handleShowVersionHistory}
    />
  )
}

export default EditProductPage
