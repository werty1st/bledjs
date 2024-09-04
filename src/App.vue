<script setup>
  import {ref, watch} from "vue"
  import BIcon from './components/b-icon.vue'
  import WledPower        from './components/Power.vue'
  import BrightnessSlider from './components/Slider.vue'
  import PresetList       from './components/PresetList.vue'
  import FxList           from './components/FxList.vue'
  import BleConnect       from './components/BleConnect.vue'

  import {Mutex, Semaphore, withTimeout} from 'async-mutex';
  const mutex = new Mutex();


  ///////////////////// NEW

  const bleDevice = ref(null)
  const powerCharacteristic         = ref(null)
  const brightnessCharacteristic    = ref(null)
  const getPresetListCharacteristic = ref(null)
  const setPresetCharacteristic     = ref(null)
  const getFxCharacteristic         = ref(null)
  const setFxCharacteristic         = ref(null)
  const isConnected = ref(false)
  const myMutex = ref(mutex)

  //received BLE Device Instance
  async function BleDevice(dev){    
    
    const SLEEP = 500

    isConnected.value = true

    await mutex.runExclusive(async () => {
      await sleeping(SLEEP)
      bleDevice.value = dev
    })

    console.log("Loading powerCharacteristic")
    await mutex.runExclusive(async () => {
      await sleeping(SLEEP)
      powerCharacteristic.value         = dev.characteristics.powerCharacteristic
    })
    console.log("Loading brightnessCharacteristic")
    await mutex.runExclusive(async () => {
      await sleeping(SLEEP)
      brightnessCharacteristic.value    = dev.characteristics.brightnessCharacteristic
    })
    console.log("Loading getPresetListCharacteristic")
    await mutex.runExclusive(async () => {
      await sleeping(SLEEP)
      getPresetListCharacteristic.value = dev.characteristics.getPresetListCharacteristic
    })    
    console.log("Loading setPresetCharacteristic")
    await mutex.runExclusive(async () => {
      await sleeping(SLEEP)
      setPresetCharacteristic.value     = dev.characteristics.setPresetCharacteristic
    })    
    console.log("Loading setFxCharacteristic")
    await mutex.runExclusive(async () => {
      await sleeping(SLEEP)
      setFxCharacteristic.value         = dev.characteristics.setFxCharacteristic
    })
    console.log("Loading getFxCharacteristic")
    await mutex.runExclusive(async () => {
      await sleeping(SLEEP)
      getFxCharacteristic.value         = dev.characteristics.getFxCharacteristic
    })

  }

  function onDisconnect(state){
    console.log("isConnected", state)
    isConnected.value = false
  }

  function sleeping(wait){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>resolve(),wait)
    })
  }

</script>

<template>
  <!-- <x-nav title="xxx"></x-nav> -->


  <div class="left"></div>
  <div class="container remote-container">

    <!-- <b-icon name="lock-fill" /> -->

    <div class="text-center mb-4">
      <BleConnect @BleDevice="BleDevice" @onDisconnect="onDisconnect" :isConnected="isConnected"  />
    </div>
  
    <div class="text-center mb-4">
      <WledPower :powerCharacteristic="powerCharacteristic" :disabled="!isConnected"  />
    </div>

    <div class="text-center mb-4">
      <BrightnessSlider :brightnessCharacteristic="brightnessCharacteristic" :disabled="!isConnected"  />
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


