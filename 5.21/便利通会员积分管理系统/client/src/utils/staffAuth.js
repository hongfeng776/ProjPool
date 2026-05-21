import { reactive } from 'vue'

const state = reactive({
  staff: null
})

const initStaffAuth = () => {
  const saved = localStorage.getItem('bianlitong_staff')
  if (saved) {
    try {
      state.staff = JSON.parse(saved)
    } catch (e) {
      state.staff = null
    }
  }
}

const login = (staffData) => {
  state.staff = staffData
  localStorage.setItem('bianlitong_staff', JSON.stringify(staffData))
}

const logout = () => {
  state.staff = null
  localStorage.removeItem('bianlitong_staff')
}

const isStaffLoggedIn = () => !!state.staff
const isAdmin = () => state.staff?.role === 'admin'

export default {
  state,
  initStaffAuth,
  login,
  logout,
  isStaffLoggedIn,
  isAdmin
}
