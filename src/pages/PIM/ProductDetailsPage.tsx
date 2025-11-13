import { useNavigate, useParams } from "react-router-dom"
import ProductViewer from "../../components/PIM/product/ProductViewer"
import { useProductData } from "../../context/ProductDataContext"
import ExportButton from '../../../helper_Functions/Export'
import { useRef, useMemo } from 'react'

const ProductDetailsPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { viewTemplates, productData, picklistOptions } = useProductData()
  const gridRef = useRef<any>(null)

  const handleEdit = () => {
    navigate(`/pim/products/${id}/edit`)
  }

  const handleBack = () => {
    navigate("/pim/products")
  }

  const handleConfigure = () => {
    navigate(`/pim/views/default`)
  }

  const columns = useMemo(() => {
    if (!viewTemplates || !viewTemplates.length) return []
    const template = viewTemplates.find(v => v.id === 'default') || viewTemplates[0]
    return template.sections.flatMap(section =>
      section.attributes.map(attr => ({ field: attr.id, title: attr.name }))
    )
  }, [viewTemplates])

  const exportData = useMemo(() => [productData], [productData])

  return (
    <>
      <ProductViewer
        viewTemplates={viewTemplates}
        productData={productData}
        picklistOptions={picklistOptions}
        activeViewId="default"
        onEdit={handleEdit}
        onBack={handleBack}
        onConfigure={handleConfigure}
        productId={id || ""}
      />
    </>
  )
}

export default ProductDetailsPage
