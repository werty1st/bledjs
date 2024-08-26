<script>
import { PRIMARY_SERVICE_UUID } from '@/constants/bluetoothConstants'

export default {

    data() {
        return {
            device: null, // Holds the connected Bluetooth device
        }
    },
    methods: {
        async connectToBluetoothDevice() {
            try {
                const device = await navigator.bluetooth.requestDevice({
                    filters: [{ services: [PRIMARY_SERVICE_UUID] }],
                })
                this.device = device // Store the device in the component's state
                this.$emit('device-connected', device) // Emit the device to parent component or app
            } catch (error) {
                console.error('Bluetooth connection failed', error)
            }
        }
    }
}
</script>

<template>
    <div>
        <button @click="connectToBluetoothDevice">Connect to Bluetooth Device</button>
        <p v-if="device">Connected to: {{ device.name }}</p>
    </div>
</template>