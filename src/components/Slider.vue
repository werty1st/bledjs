<template>
    <label for="brightness" class="form-label">Brightness</label>
    <input type="range"
        id="brightness"
        :value="brightness"
        :disabled
        @input="({ target }) => (brightness = parseFloat(target.value))"
        class="form-range"
        min="5" max="255" step="1">
</template>


<script setup>
import { ref, watch } from 'vue'
import { BRIGHTNESS_CHARACTERISTIC_UUID } from '@/shared/bluetoothConstants'
import { handleNotifications } from '@/shared/notificationHandler'
import { throttle } from '@/shared/throttle'

//receive brightnessCharacteristic and connection State
const props = defineProps({
    brightnessCharacteristic: Object,
    disabled: Boolean
})

//track power On/Off
const brightness = ref(0)

//on Change set Listener
watch( ()=>props.brightnessCharacteristic, async (brightnessCharacteristic)=>{

    brightness.value = (await brightnessCharacteristic.readValue()).getUint8(0)

    // todo: fix memory leak
    brightnessCharacteristic.startNotifications().then(() => {
        console.log('subscribed')
        brightnessCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications(value=>{
            brightness.value = value.getUint8(0)
            console.log("Changed Brightness Remotely", brightness.value)
        }))
    })

})

watch(brightness, (bri) => {
    sliderThrottledUpdateFn(bri)
})

//create rateLimited Callback
const sliderThrottledUpdateFn = throttle(bri=>setBrightness(bri), 100)

//send update via BLE
function setBrightness(bri){
    props.brightnessCharacteristic.writeValue( Uint8Array.of([bri]) )
}



</script>
