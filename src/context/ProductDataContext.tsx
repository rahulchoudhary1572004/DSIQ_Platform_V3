import { createContext, useContext, useState } from "react"
import { mockViewTemplates, mockProductData, mockPicklistOptions, mockFieldMappingTemplates } from "../data/mockData"

const ProductDataContext = createContext(undefined)

export const useProductData = () => {
  const context = useContext(ProductDataContext)
  if (!context) {
    throw new Error("useProductData must be used within a ProductDataProvider")
  }
  return context
}

export const ProductDataProvider = ({ children }) => {
  const [viewTemplates, setViewTemplates] = useState(mockViewTemplates)
  const [productData, setProductData] = useState(mockProductData)
  const [picklistOptions, setPicklistOptions] = useState(mockPicklistOptions)
  const [fieldMappingTemplates, setFieldMappingTemplates] = useState(mockFieldMappingTemplates)

  return (
    <ProductDataContext.Provider
      value={{
        viewTemplates,
        setViewTemplates,
        productData,
        setProductData,
        picklistOptions,
        setPicklistOptions,
        fieldMappingTemplates,
        setFieldMappingTemplates,
      }}
    >
      {children}
    </ProductDataContext.Provider>
  )
}
