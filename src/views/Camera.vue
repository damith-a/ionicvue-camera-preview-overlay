<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Ionic camera</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div id="cameraPreview" class="cameraPreview">
        <div v-if="cameraActive">
          <img src="../assets/overlay.png" class="image-overlay" />
          <!-- <ion-img :src="assets/overlay.png" class="image-overlay"></ion-img> -->

          <ion-button @click="stopCamera" expand="block" id="close">
            <ion-icon :icon="closeCircle"></ion-icon>
          </ion-button>
          <ion-button @click="captureImage" expand="block" id="capture">
            <ion-icon :icon="camera"></ion-icon>
          </ion-button>
          <ion-button @click="flipCamera" expand="block" id="flip">
            <ion-icon :icon="cameraReverse"></ion-icon>
          </ion-button>
        </div>
      </div>
      <ion-img :src="image" v-if="image && !cameraActive"></ion-img>
      <ion-button @click="openCamera" expand="full" v-if="!cameraActive"
        >Open camera</ion-button
      >
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { Plugins } from "@capacitor/core";
const { CameraPreview } = Plugins;
import {
  CameraPreviewOptions,
  CameraPreviewPictureOptions,
} from "@capacitor-community/camera-preview";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonImg,
  IonButton,
  IonIcon,
  isPlatform,
} from "@ionic/vue";
import { cameraReverse, camera, closeCircle } from "ionicons/icons";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { isNil } from "lodash";
import { useFormatDate } from "@/composables/FormatDate";
import { Capacitor } from "@capacitor/core";
const { registerPlugin } = Capacitor;
//Need this for register in web
import "@capacitor-community/camera-preview";

export interface MyPhoto {
  filepath: string;
  taken: string;
  webviewPath?: string;
}

export default defineComponent({
  name: "Camera",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonImg,
    IonButton,
    IonIcon,
  },
  setup() {
    const image = ref("");
    const cameraActive = ref(false);
    const { toLocalISODate } = useFormatDate();

    const savePicture = async (
      photoStr: string,
      fileName: string
    ): Promise<MyPhoto> => {
      let base64Data = "";
      // "hybrid" will detect Cordova or Capacitor;
      if (isPlatform("hybrid") && !isNil(photoStr)) {
        base64Data = photoStr;
      }

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data,
      });

      const date = toLocalISODate(new Date());

      if (isPlatform("hybrid")) {
        // Display the new image by rewriting the 'file://' path to HTTP
        // Details: https://ionicframework.com/docs/building/webview#file-protocol
        return {
          filepath: savedFile.uri,
          webviewPath: Capacitor.convertFileSrc(savedFile.uri),
          taken: date,
        };
      } else {
        // Use webPath to display the new image instead of base64 since it's
        // already loaded into memory
        return {
          filepath: fileName,
          webviewPath: photoStr,
          taken: date,
        };
      }
    };

    const openCamera = () => {
      const cameraPreviewOptions: CameraPreviewOptions = {
        position: "rear",
        parent: "cameraPreview",
        className: "cameraPreview",
        toBack: true,
        // storeToFile: true // If you have to store it in a file
      };
      CameraPreview.start(cameraPreviewOptions);
      cameraActive.value = true;
    };

    const stopCamera = async () => {
      await CameraPreview.stop();
      cameraActive.value = false;
    };

    const captureImage = async () => {
      const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
        quality: 90,
      };
      const result = await CameraPreview.capture(cameraPreviewPictureOptions);
      console.log("result>>", result.value);
      image.value = `data:image/jpeg;base64,${result.value}`;
      const fileName = new Date().getTime() + ".jpeg";
      const savedFileImage = await savePicture(result.value, fileName);
      console.log('savedFileImage',savedFileImage);

      // image.value = result.value;
      stopCamera();
    };

    const flipCamera = () => {
      CameraPreview.flip();
    };

    return {
      image,
      cameraActive,
      openCamera,
      cameraReverse,
      camera,
      closeCircle,
      stopCamera,
      captureImage,
      flipCamera,
      toLocalISODate
    };
  },
});
</script>
<style scoped>
ion-content {
  --background: transparent !important;
}

/* .my-custom-camera-preview-content {
  --background: transparent;
} */

.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.cameraPreview {
  display: flex;
  width: 100%;
  height: 100%;
  position: absolute;
}

.image-overlay {
  z-index: 1;
  position: absolute;
  left: 25%;
  top: 25%;
  width: 50%;
}

#capture {
  position: absolute;
  bottom: 30px;
  left: calc(50% - 25px);
  width: 50px;
  height: 50px;
  z-index: 11;
}

#close {
  position: absolute;
  bottom: 30px;
  left: calc(50% -175px);
  width: 50px;
  height: 50px;
  z-index: 11;
}

#flip {
  position: absolute;
  bottom: 30px;
  left: calc(50% + 125px);
  width: 50px;
  height: 50px;
  z-index: 11;
}

#close::part(native) {
  border-radius: 30px;
}
#capture::part(native) {
  border-radius: 30px;
}
#flip::part(native) {
  border-radius: 30px;
}
</style>
