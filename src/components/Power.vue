<template>
    <button id="powerButton"
        @click="toogleWled"
        :class="{ active: powerState }"
        class="btn btn-danger control-button">
    <i class="bi bi-power"></i> Power
    {{ !powerState?"Off":"On" }}
    </button>
</template>


<script setup type="ts">
import { ref, watch } from 'vue'
import { POWER_CHARACTERISTIC_UUID } from '@/shared/bluetoothConstants'
import { handleNotifications } from '@/shared/notificationHandler'

//receive powerCharacteristic and connection State
const props = defineProps({
    powerCharacteristic: Object
})

//track power On/Off
const powerState = ref(false)

//on Change set Listener
watch( ()=>props.powerCharacteristic, async (powerCharacteristic)=>{

    powerState.value = !!(await powerCharacteristic.readValue()).getUint8(0)

    powerCharacteristic.startNotifications().then(() => {
        console.log('subscribed')
        powerCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications(value=>{
            powerState.value = !!value.getUint8(0)
            console.log("Changed Power Remotely", powerState.value)
        }))
    })

})


async function toogleWled(params) {
    console.log('toogleWled')
    powerState.value = !powerState.value
    await props.powerCharacteristic.writeValue(  Uint8Array.of([ powerState.value ? 1 : 0 ]) )
}

</script>


