<template>
    <div>
        <h3>Presets</h3>
        <div class="">
            <ul id="preset-list">
                <li v-for="preset in presets">
                    <button class="" @click="applyPreset(preset.id)" :preset-id="preset.id">
                        {{ preset.name }}
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { PRESETLIST_CHARACTERISTIC_UUID, PRESET_CHARACTERISTIC_UUID } from '@/shared/bluetoothConstants'
import { handleNotifications } from '@/shared/notificationHandler'

//receive brightnessCharacteristic and connection State
const props = defineProps({
    getPresetListCharacteristic: Object,
    setPresetCharacteristic: Object,
    disabled: Boolean,
})

const presets = ref([])

//on Change set Listener
watch( [ ()=>props.getPresetListCharacteristic, () => props.disabled], async ([getPresetListCharacteristic, disabled])=>{
    

    if (disabled){
        presets.value = []
    } else {
        presets.value = await readPresets( getPresetListCharacteristic )
    }
    //setPresetCharacteristic

})

async function readPresets( getPresetListCharacteristic ){

    const presets = []
    
    if (getPresetListCharacteristic.properties.read) {

        const text = new TextDecoder("utf-8").decode(await getPresetListCharacteristic.readValue())
        const presetsObj = JSON.parse(text)

        for (const [key, value] of Object.entries(presetsObj)) {
            if (value && value.length > 0)
            presets.push({ id: key, name: value })
        }
        //console.log("Received presets:", presets)
    }
    return presets
}

async function applyPreset(presetId) {
    if (props.setPresetCharacteristic && props.setPresetCharacteristic.properties.write) {
        await props.setPresetCharacteristic.writeValue( Uint8Array.of([parseInt(presetId)]) )
    }
}

</script>





<style scoped>
ul {
  list-style: none;
}


li > button {
    min-width: 200px;
}

</style>
