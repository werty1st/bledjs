<script setup>
  import {ref, watch} from "vue"
  import BIcon from './components/b-icon.vue'
  import BleConnect from './components/Connect.vue'
  import WledPower from './components/Power.vue'
  import BrightnessSlider from './components/Slider.vue'
  import PresetList from './components/PresetList.vue'
  import FxList from './components/FxList.vue'



  const connected = ref(false)
  const presets = ref([])
  const sliderValue = ref(0);

  var device = false
  var gatt = false
  var service = false
  //var getPresetListCharacteristic = false
  //var setPresetCharacteristic = false
  //var brightnessCharacteristic = false
  //var powerCharacteristic = false

  var powerState = ref(false)
  var brightness = ref(0)

  // const PRIMARY_SERVICE_UUID           = "b2bbc642-46da-11ed-b878-0242ac120002"
  // const PRESETLIST_CHARACTERISTIC_UUID = "c9af9c76-46de-11ed-b878-0242ac120002"
  // const PRESET_CHARACTERISTIC_UUID     = "c9af9c76-56de-11ed-b878-0242ac120002"
  // const BRIGHTNESS_CHARACTERISTIC_UUID = "c9af9c76-76de-11ed-b878-0242ac120002"
  // const POWER_CHARACTERISTIC_UUID      = "c9af9c76-66de-11ed-b878-0242ac120002"


  function throttle(fn, wait){
      let throttled = false
      let latest
      return function(...args){
          latest = args
          if(!throttled){
              //fn.apply(this,args);
              throttled = true;
              setTimeout(()=>{
                  throttled = false;
                  fn.apply(this,latest);
              }, wait);
          }
      }
  }

  function handleNotifications(event) {
    const value = event.target.value
    const uuid = event.target.uuid
    switch (uuid) {
      case POWER_CHARACTERISTIC_UUID:
        powerState.value = !!value.getUint8(0)
        console.log("Changed Power Remotely", powerState.value)
        break;
      case BRIGHTNESS_CHARACTERISTIC_UUID:
        brightness.value = value.getUint8(0)
        console.log("Changed Brightness Remotely", brightness.value)
        break;
    
      default:
        break;
    }
    let a = [];
    // Convert raw data bytes to hex values just for the sake of showing something.
    // In the "real" world, you'd use data.getUint8, data.getUint16 or even
    // TextDecoder to process raw data bytes.
    for (let i = 0; i < value.byteLength; i++) {
      a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
    }
    console.log('> ' + a.join(' '));
  }


  async function activatePreset( id ){
    console.log("selected preset:", id)
    await setPresetCharacteristic.writeValue( Uint8Array.of([parseInt(id)]) )
  }

  async function loadPresets(){

    presets.value = []
    
    if (getPresetListCharacteristic.properties.read) {
      const value = await getPresetListCharacteristic.readValue()

      const enc = new TextDecoder("utf-8");
      const text = enc.decode(value)

      const presetsJson = JSON.parse(text)

      for (const [key, value] of Object.entries(presetsJson)) {
        if (value && value.length > 0)
          presets.value.push({ id: key, name: value })
      }
      //console.log("Received presets:", presets)
    }

    // presets.value = [
    //   { id: 1, name: "set1" },
    //   { id: 2, name: "set2" },
    //   { id: 3, name: "set3" },
    //   { id: 4, name: "set4" },
    //   { id: 5, name: "set5" },
    //   { id: 6, name: "set6" },
    // ]

  }

  async function toogleWled(){
    console.log("toggle", powerState.value = !powerState.value)
    //await setPresetCharacteristic.writeValue( Uint8Array.of([100]) )
    await powerCharacteristic.writeValue(  Uint8Array.of([ powerState.value ? 1 : 0 ]) )
  }
  async function setBrightness(bri){
    console.log("bri", bri)
    await brightnessCharacteristic.writeValue( Uint8Array.of([bri]) )
  }

  watch(brightness, (newX) => {
    //const b2 = throttle(setBrightness, 500)
    //console.log(`x is ${newX}`)
    throttle(setBrightness, 500)(newX)
  })

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


    <!-- <div class="text-center mb-4">
      <FxList
      :disabled="!isConnected"
      :getFxCharacteristic="getFxCharacteristic"
      :setFxCharacteristic="setFxCharacteristic"
      />
    </div> -->

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


