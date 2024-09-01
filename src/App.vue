<script setup>
  import {ref, watch} from "vue"
  import BIcon from './components/b-icon.vue'
  import WledPower        from './components/Power.vue'
  import BrightnessSlider from './components/Slider.vue'
  import PresetList       from './components/PresetList.vue'
  import FxList           from './components/FxList.vue'
  import BleConnect       from './components/BleConnect.vue'

  ///////////////////// NEW

  const bleDevice = ref(null)
  const powerCharacteristic         = ref(null)
  const brightnessCharacteristic    = ref(null)
  const getPresetListCharacteristic = ref(null)
  const setPresetCharacteristic     = ref(null)
  const getFxCharacteristic         = ref(null)
  const setFxCharacteristic         = ref(null)
  const isConnected = ref(false)

  //received BLE Device Instance
  function BleDevice(dev){    
    bleDevice.value = dev
    powerCharacteristic.value         = dev.characteristics.powerCharacteristic
    brightnessCharacteristic.value    = dev.characteristics.brightnessCharacteristic
    getPresetListCharacteristic.value = dev.characteristics.getPresetListCharacteristic
    setPresetCharacteristic.value     = dev.characteristics.setPresetCharacteristic
    getFxCharacteristic.value         = dev.characteristics.getFxCharacteristic
    setFxCharacteristic.value         = dev.characteristics.setFxCharacteristic
    isConnected.value = true
  }

  function onDisconnect(state){
    console.log("isConnected", state)
    isConnected.value = false
  }


</script>

<template>
  <!-- <x-nav title="xxx"></x-nav> -->


  <div class="left"></div>
  <div class="container remote-container">

    <!-- <b-icon name="lock-fill" /> -->

    <div class="text-center mb-4">
      <BleConnect @BleDevice="BleDevice" @onDisconnect="onDisconnect" :isConnected="isConnected" />
    </div>
  
    <div class="text-center mb-4">
      <WledPower :powerCharacteristic="powerCharacteristic" :disabled="!isConnected"/>
    </div>

    <div class="text-center mb-4">
      <BrightnessSlider :brightnessCharacteristic="brightnessCharacteristic" :disabled="!isConnected"/>
    </div>

    <div class="text-center mb-4">
      <PresetList
      :disabled="!isConnected"
      :getPresetListCharacteristic="getPresetListCharacteristic"
      :setPresetCharacteristic="setPresetCharacteristic"
      />
    </div>


    <div class="text-center mb-4">
      <FxList
      :disabled="!isConnected"
      :getFxCharacteristic="getFxCharacteristic"
      :setFxCharacteristic="setFxCharacteristic"
      />
    </div>

  </div>
  <div class="right"></div>

</template>
<style scoped>
  .box {
      box-shadow: inset 7px 0 9px -7px rgba(0,0,0,0.3),
                  inset -7px 0 9px -7px rgba(0,0,0,0.3);
  }
  #app .center {
    padding: 0 1rem 0 1rem;
    background-color: white;
  }
  #app {
    background-color:rgb(235 249 251);
  }
</style>


