import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStocktakeStore = defineStore('stocktake', () => {
  const stocktakeRecords = ref([
    {
      id: 1,
      orderNo: 'PD20240520001',
      title: '5月月度盘点',
      status: 2,
      totalCount: 4,
      profitCount: 1,
      lossCount: 1,
      normalCount: 2,
      operator: '管理员',
      remark: '月度常规盘点',
      createTime: '2024-05-20 09:00:00',
      finishTime: '2024-05-20 10:30:00',
      details: [
        { productId: 1, productName: 'iPhone 15 Pro', systemStock: 100, actualStock: 102, diff: 2, status: 1 },
        { productId: 2, productName: 'MacBook Pro 14', systemStock: 50, actualStock: 48, diff: -2, status: 2 },
        { productId: 3, productName: 'AirPods Pro', systemStock: 200, actualStock: 200, diff: 0, status: 0 },
        { productId: 4, productName: 'iPad Air', systemStock: 80, actualStock: 80, diff: 0, status: 0 }
      ]
    }
  ])

  const addStocktake = (stocktake) => {
    stocktake.id = Date.now()
    stocktake.orderNo = `PD${Date.now()}`
    stocktake.createTime = new Date().toLocaleString()
    stocktake.status = 0
    stocktake.operator = '管理员'
    stocktakeRecords.value.unshift(stocktake)
    return stocktake.id
  }

  const updateStocktake = (id, data) => {
    const index = stocktakeRecords.value.findIndex(item => item.id === id)
    if (index !== -1) {
      stocktakeRecords.value[index] = { ...stocktakeRecords.value[index], ...data }
    }
  }

  const getStocktakeById = (id) => {
    return stocktakeRecords.value.find(item => item.id === id)
  }

  const finishStocktake = (id) => {
    const index = stocktakeRecords.value.findIndex(item => item.id === id)
    if (index !== -1) {
      const record = stocktakeRecords.value[index]
      record.status = 2
      record.finishTime = new Date().toLocaleString()
      
      let profitCount = 0
      let lossCount = 0
      let normalCount = 0
      
      record.details.forEach(item => {
        if (item.diff > 0) profitCount++
        else if (item.diff < 0) lossCount++
        else normalCount++
      })
      
      record.profitCount = profitCount
      record.lossCount = lossCount
      record.normalCount = normalCount
      record.totalCount = record.details.length
    }
  }

  const pendingCount = computed(() => {
    return stocktakeRecords.value.filter(item => item.status === 0).length
  })

  const processingCount = computed(() => {
    return stocktakeRecords.value.filter(item => item.status === 1).length
  })

  const finishedCount = computed(() => {
    return stocktakeRecords.value.filter(item => item.status === 2).length
  })

  return {
    stocktakeRecords,
    addStocktake,
    updateStocktake,
    getStocktakeById,
    finishStocktake,
    pendingCount,
    processingCount,
    finishedCount
  }
})
