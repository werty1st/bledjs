<template>
    <div>
        <button @click="connect">Connect to Bluetooth Device</button>
        <p v-if="device">Connected to: {{ device.name }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { PRIMARY_SERVICE_UUID,
        PRESETLIST_CHARACTERISTIC_UUID,
        PRESET_CHARACTERISTIC_UUID,
        BRIGHTNESS_CHARACTERISTIC_UUID,
        GET_FX_CHARACTERISTIC_UUID,
        SET_FX_CHARACTERISTIC_UUID,
        POWER_CHARACTERISTIC_UUID } from '@/shared/bluetoothConstants'

// get State from Parents onDicsonnect Event Handler
const props = defineProps({
    isConnected: Boolean
})

// State
const device = ref(null)        // Holds the connected Bluetooth device stuff

// Emits
const emit = defineEmits(['BleDevice', 'onDisconnect'])

// Methods
async function connect() {

    function onDisconnected() {
        console.log('> Bluetooth Device disconnected')
        device.value = null
        emit("onDisconnect", false)
    }


    if (device.value?.gatt?.connected == true) {

        if (device.value.gatt.connected) {
            device.value.gatt.disconnect();
        } else {
            console.loglog('> Bluetooth Device is already disconnected')
        }
    } else {
        const selectedDevice = await navigator.bluetooth.requestDevice({
            filters: [{
                services: [PRIMARY_SERVICE_UUID]
            }],
        })
        selectedDevice.addEventListener('gattserverdisconnected', onDisconnected)
        device.value = selectedDevice
        const gatt = await selectedDevice.gatt.connect()
        const service = await gatt.getPrimaryService(PRIMARY_SERVICE_UUID)
    
        const getPresetListCharacteristic = await service.getCharacteristic(PRESETLIST_CHARACTERISTIC_UUID)
        const setPresetCharacteristic     = await service.getCharacteristic(PRESET_CHARACTERISTIC_UUID)
        const brightnessCharacteristic    = await service.getCharacteristic(BRIGHTNESS_CHARACTERISTIC_UUID)
        const powerCharacteristic         = await service.getCharacteristic(POWER_CHARACTERISTIC_UUID)
        const getFxCharacteristic         = await service.getCharacteristic(GET_FX_CHARACTERISTIC_UUID)
        const setFxCharacteristic         = await service.getCharacteristic(SET_FX_CHARACTERISTIC_UUID)
    
        // return to parent
        emit('BleDevice', {
            characteristics: {
                getPresetListCharacteristic,
                setPresetCharacteristic,
                brightnessCharacteristic,
                powerCharacteristic,
                getFxCharacteristic,
                setFxCharacteristic
            },
            device: selectedDevice,
            gatt: gatt,
            service: service
        })
    }


}


</script>


