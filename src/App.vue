<template>
  <div id="app">
    <div id="nav">
      <router-link to="/Cloud_YAML">Cloud_YAML</router-link> |
      <a style="cursor: pointer;" @click="toggleDonate()">
        <i class="ui icon dollar"/>Donate<i class="ui icon btc"/>
      </a>
      <a style="float: right;display:block;cursor: pointer;" @click="toggleShareNetwork()" ><!-- TODO doge-->
        <i class="ui right  icon share">

        </i>Share
      </a>
    </div>
    <router-view />
    <!-- FIXME : some media queries for correct btc render on mobile : input + copy button, no QR -->
    <!-- FIXME : debounce toggles -->
    <div class="ui dimmer" style="position: fixed; z-index: 200000; background-color: rgba(0, 0, 0, 0.95);" v-if="isDonateActive" v-bind:class="{ 'active': isDonateActive }" @click="toggleDonate()">
      <div class="content">
        <img src="@/assets/raining-money.gif" style="height:200px;"/>
        <h2 ref="btcHeader" class="ui header" style="color: white;cursor: pointer;" data-tooltip="Click to copy Btc address in clipboard or scan QR code" @click.prevent.stop="copyClipboardBtcAdress()">
            <i class="large inverted icons" style="color: white; ">
              <i class="btc icon" style="color: white;"></i>
            </i>
            <p style="word-break: break-all;">
            {{ btcAddress }}
            </p>
            <img src="btcQr.png"  style="width:33%" />
          </h2>
          <h2 class="ui header" style="color: white;cursor: pointer;" data-tooltip="Click to open Lydia donation" @click="openDonate()">
            <div>
            <i class="large inverted icons" style="color: white; ">
              <i class="dollar icon" style="color: white;"></i>
            </i>
            /
            <i class="large inverted icons" style="color: white; margin-left: 5px">
               <i class="euro icon" style="color: white;"></i>
            </i>
            <a style="color:white;display: inline-block;cursor: pointer;" >https://lydia-app.com/collect/34231-jseguillon</a>
            </div>
          </h2>
      </div>
    </div>
    <div class="ui dimmer" style="position: fixed;z-index: 200000; background-color: rgba(0, 0, 0, 0.95);" v-bind:class="{ 'active': isShareNetworkActive }" @click="toggleShareNetwork()">
      <div class="content">
        <h1 class="ui inverted icon header">
          Spread the word !
        </h1>

        <p style="margin-top: 40px">
        <ShareNetwork style="color: white;"
            network="twitter"
            url="https://editah.io"
            title="Editah.io is brand new online editor and validator for Kubernetes YAMLs. Check it out !"
            hashtags="editah,kubernetes,yaml,online,devops"
            twitter-user="IoEditah"
          >
          <h2 class="ui header" style="color: white;">
            <i class="large inverted icons" style="color: white; ">
              <i class="twitter icon" style="color: white;"></i>
              <i class="inverted corner share icon" style="color: white;"></i>
            </i>
            Twitter
          </h2>
        </ShareNetwork>
        <br/>
        <br/>
        <ShareNetwork style="color: white;"
            network="reddit"
            url="https://editah.io"
            title="Editah.io is brand new online editor and validator for Kubernetes YAMLs. Check it out !"
            hashtags="kubernetes,devops,online,yaml"
          >
          <h2 class="ui header" style="color: white;">
            <i class="large inverted icons" style="color: white; ">
              <i class="reddit icon" style="color: white;"></i>
              <i class="inverted corner share icon" style="color: white;"></i>
            </i>
            Reddit
          </h2>
        </ShareNetwork>
        <br/>
        <br/>
        <ShareNetwork style="color: white;"
            network="linkedin"
            url="https://editah.io"
            title="Editah.io is brand new online editor and validator for Kubernetes YAMLs. Check it out !"
            hashtags="kubernetes,devops,online,yaml"
          >
          <h2 class="ui header" style="color: white;">
            <i class="large inverted icons" style="color: white; ">
              <i class="linkedin icon" style="color: white;"></i>
              <i class="inverted corner share icon" style="color: white;"></i>
            </i>
            LinkedIn
          </h2>
        </ShareNetwork>
        </p>
      </div>
    </div>
    <div style="margin-left:28%;width:56%"><TwitterFeed  src="https://twitter.com/IoEditah?ref_src=twsrc%5Etfw"></TwitterFeed></div>
    <div class="ui inverted vertical footer segment form-page">
      <div class="ui container">
        Copyright 2021 &copy;Editah.io - Online editors for Kubernetes resources. All rights reserved. <br/> Made with ❤️ by <a href="https://github.com/jseguillon">github.com/jseguillon</a>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  created() {

  },
  mounted() {

  },
  computed: {

  },
  methods: {
    copyClipboardBtcAdress() {
      this.$copyText(this.btcAddress).then(function () {
      }, function () {
        alert('Can not copy')
      })

      this.$refs.btcHeader.setAttribute("data-tooltip", "Btc address now in cliboard !")
      setTimeout(() => this.$refs.btcHeader.setAttribute("data-tooltip", "Click to copy Btc address in clipboard or scan QR code"), 3000)
    },
    openDonate(){
      window.open("https://lydia-app.com/collect/34231-jseguillon", '_blank');
    },
    toggleShareNetwork() {
      return this.isShareNetworkActive = ! this.isShareNetworkActive
    },
    toggleDonate() {
      return this.isDonateActive = ! this.isDonateActive
    }
  },
  data() {
    return {
      isShareNetworkActive: false,
      isDonateActive: false,
      btcAddress: "bc1qjc907aq30thvegk42v9hs2prks6ugyw4ylgdu7znw26fmn6570uqdqmsxj"
    }
  }
}
</script>

<style>
.ui.footer.form-page {
  margin-top: 10px;
}

.ui.dimmer {
  height: 110%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
