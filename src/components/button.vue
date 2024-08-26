<script setup>
import {ref} from "vue"

defineProps(['title'])
const emit = defineEmits(['knusper'])

function create(){
    console.log("create")
    const x = ref(Date)
    emit('knusper', x)
}

</script>


<template>
  <div class="blog-post">
    <h4>{{ title }}</h4>
    <button @click="$emit('enlarge-text')">Enlarge text</button>
    <button @click="create">knusper text</button>
  </div>
</template>