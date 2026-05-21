import { reactive } from 'vue'

const state = reactive({
  member: null
})

const initAuth = () => {
  const saved = localStorage.getItem('bianlitong_member')
  if (saved) {
    try {
      state.member = JSON.parse(saved)
    } catch (e) {
      state.member = null
    }
  }
}

const login = (memberData) => {
  state.member = memberData
  localStorage.setItem('bianlitong_member', JSON.stringify(memberData))
}

const logout = () => {
  state.member = null
  localStorage.removeItem('bianlitong_member')
}

const updateMember = (memberData) => {
  state.member = { ...state.member, ...memberData }
  localStorage.setItem('bianlitong_member', JSON.stringify(state.member))
}

const isLoggedIn = () => !!state.member

export default {
  state,
  initAuth,
  login,
  logout,
  updateMember,
  isLoggedIn
}
