import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWarehouseStore = defineStore('warehouse', () => {
  const warehouses = ref([
    { id: 1, name: '主仓库', address: '北京市朝阳区', manager: '张三', phone: '13800138001', status: 1, remark: '主要存放A类商品' },
    { id: 2, name: '备用仓库', address: '北京市海淀区', manager: '李四', phone: '13800138002', status: 1, remark: '存放B类和C类商品' },
    { id: 3, name: '冷链仓库', address: '北京市顺义区', manager: '王五', phone: '13800138003', status: 0, remark: '需要冷藏的特殊商品' }
  ])

  const currentWarehouse = ref(1)

  const activeWarehouses = computed(() => {
    return warehouses.value.filter(item => item.status === 1)
  })

  const addWarehouse = (warehouse) => {
    warehouse.id = Date.now()
    warehouses.value.push(warehouse)
  }

  const updateWarehouse = (id, data) => {
    const index = warehouses.value.findIndex(item => item.id === id)
    if (index !== -1) {
      warehouses.value[index] = { ...warehouses.value[index], ...data }
    }
  }

  const deleteWarehouse = (id) => {
    const index = warehouses.value.findIndex(item => item.id === id)
    if (index !== -1) {
      warehouses.value.splice(index, 1)
    }
  }

  const getWarehouseById = (id) => {
    return warehouses.value.find(item => item.id === id)
  }

  const setCurrentWarehouse = (id) => {
    currentWarehouse.value = id
  }

  return {
    warehouses,
    currentWarehouse,
    activeWarehouses,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getWarehouseById,
    setCurrentWarehouse
  }
})
