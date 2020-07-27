<template>
  <chooseUser v-model="plateAdminJson" :allow-write="false" :select-role="roles" />
</template>

<script>
import chooseUser from './components/chooseUser'
export default {
  name: 'app',
  data () {
    return {
      allowWrite: false,
      plateAdminJson: [],
      roles: []
    }
  }
}
</script>

