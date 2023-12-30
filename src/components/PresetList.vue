<script setup>
defineProps(["presets"])
</script>



<template>
  <div >
    <h3>Presets</h3>
    <div class="uk-flex uk-flex-center">
      <ul id="preset-list">
        <li v-for="preset in presets">
          <button 
            class="uk-button uk-button-primary uk-margin-bottom" 
            @click="$emit('selectPreset', preset.id)"
            :preset-id="preset.id">
            {{ preset.name }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
ul {
  list-style: none;
}

li {

}


</style>
