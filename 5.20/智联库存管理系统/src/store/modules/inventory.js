import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  const inRecords = ref([
    { id: 1, productId: 1, productName: 'iPhone 15 Pro', quantity: 50, price: 7999, total: 399950, operator: '管理员', remark: '首批进货', createTime: '2024-05-15 10:30:00' },
    { id: 2, productId: 2, productName: 'MacBook Pro 14', quantity: 20, price: 12999, total: 259980, operator: '管理员', remark: '补货', createTime: '2024-05-16 14:20:00' },
    { id: 3, productId: 3, productName: 'AirPods Pro', quantity: 100, price: 1599, total: 159900, operator: '管理员', remark: '', createTime: '2024-05-17 09:10:00' }
  ])

  const outRecords = ref([
    { id: 1, productId: 1, productName: 'iPhone 15 Pro', quantity: 10, price: 8999, total: 89990, operator: '管理员', remark: '门店销售', createTime: '2024-05-18 11:00:00' },
    { id: 2, productId: 3, productName: 'AirPods Pro', quantity: 30, price: 1899, total: 56970, operator: '管理员', remark: '电商订单', createTime: '2024-05-19 15:30:00' }
  ])

  const addInRecord = (record) => {
    record.id = Date.now()
    record.createTime = new Date().toLocaleString()
    record.operator = '管理员'
    record.total = record.quantity * record.price
    inRecords.value.unshift(record)
  }

  const addOutRecord = (record) => {
    record.id = Date.now()
    record.createTime = new Date().toLocaleString()
    record.operator = '管理员'
    record.total = record.quantity * record.price
    outRecords.value.unshift(record)
  }

  const todayInCount = computed(() => {
    const today = new Date().toLocaleDateString()
    return inRecords.value
      .filter(item => new Date(item.createTime).toLocaleDateString() === today)
      .reduce((sum, item) => sum + item.quantity, 0)
  })

  const todayOutCount = computed(() => {
    const today = new Date().toLocaleDateString()
    return outRecords.value
      .filter(item => new Date(item.createTime).toLocaleDateString() === today)
      .reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalInCount = computed(() => {
    return inRecords.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalOutCount = computed(() => {
    return outRecords.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  return {
    inRecords,
    outRecords,
    addInRecord,
    addOutRecord,
    todayInCount,
    todayOutCount,
    totalInCount,
    totalOutCount
  }
})
