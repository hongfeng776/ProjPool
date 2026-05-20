import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductStore = defineStore('product', () => {
  const productList = ref([
    { id: 1, name: 'iPhone 15 Pro', category: '手机数码', price: 8999, warningStock: 50, status: 1, barcode: 'P001' },
    { id: 2, name: 'MacBook Pro 14', category: '电脑办公', price: 14999, warningStock: 30, status: 1, barcode: 'P002' },
    { id: 3, name: 'AirPods Pro', category: '手机数码', price: 1899, warningStock: 100, status: 1, barcode: 'P003' },
    { id: 4, name: 'iPad Air', category: '平板电脑', price: 4799, warningStock: 50, status: 0, barcode: 'P004' }
  ])

  const stockByWarehouse = ref([
    { productId: 1, warehouseId: 1, stock: 60 },
    { productId: 1, warehouseId: 2, stock: 40 },
    { productId: 2, warehouseId: 1, stock: 30 },
    { productId: 2, warehouseId: 2, stock: 20 },
    { productId: 3, warehouseId: 1, stock: 120 },
    { productId: 3, warehouseId: 2, stock: 80 },
    { productId: 4, warehouseId: 1, stock: 50 },
    { productId: 4, warehouseId: 2, stock: 30 }
  ])

  const categories = ref([
    { id: 1, name: '手机数码' },
    { id: 2, name: '电脑办公' },
    { id: 3, name: '平板电脑' }
  ])

  const addProduct = (product) => {
    product.id = Date.now()
    productList.value.push(product)
  }

  const updateProduct = (id, product) => {
    const index = productList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      productList.value[index] = { ...productList.value[index], ...product }
    }
  }

  const deleteProduct = (id) => {
    const index = productList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      productList.value.splice(index, 1)
    }
  }

  const getProductStock = (productId, warehouseId) => {
    const item = stockByWarehouse.value.find(s => s.productId === productId && s.warehouseId === warehouseId)
    return item ? item.stock : 0
  }

  const getProductTotalStock = (productId) => {
    return stockByWarehouse.value
      .filter(s => s.productId === productId)
      .reduce((sum, item) => sum + item.stock, 0)
  }

  const stockIn = (productId, warehouseId, quantity) => {
    const index = stockByWarehouse.value.findIndex(s => s.productId === productId && s.warehouseId === warehouseId)
    if (index !== -1) {
      stockByWarehouse.value[index].stock += quantity
    } else {
      stockByWarehouse.value.push({ productId, warehouseId, stock: quantity })
    }
  }

  const stockOut = (productId, warehouseId, quantity) => {
    const index = stockByWarehouse.value.findIndex(s => s.productId === productId && s.warehouseId === warehouseId)
    if (index !== -1 && stockByWarehouse.value[index].stock >= quantity) {
      stockByWarehouse.value[index].stock -= quantity
      return true
    }
    return false
  }

  const getProductById = (id) => {
    return productList.value.find(item => item.id === id)
  }

  const getProductByBarcode = (barcode) => {
    return productList.value.find(item => item.barcode === barcode)
  }

  const warningProducts = computed(() => {
    return productList.value.filter(item => {
      const totalStock = getProductTotalStock(item.id)
      return totalStock <= item.warningStock && item.status === 1
    })
  })

  const warningCount = computed(() => {
    return warningProducts.value.length
  })

  const updateWarningStock = (id, warningStock) => {
    const index = productList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      productList.value[index].warningStock = warningStock
    }
  }

  const productsWithStock = computed(() => {
    return productList.value.map(product => ({
      ...product,
      stock: getProductTotalStock(product.id)
    }))
  })

  return {
    productList,
    categories,
    stockByWarehouse,
    productsWithStock,
    addProduct,
    updateProduct,
    deleteProduct,
    stockIn,
    stockOut,
    getProductById,
    getProductByBarcode,
    getProductStock,
    getProductTotalStock,
    warningProducts,
    warningCount,
    updateWarningStock
  }
})
