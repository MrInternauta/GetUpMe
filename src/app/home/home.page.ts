import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { MyComponentComponent } from '../components/my-component/my-component.component';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
// import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
// import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  lat: number;
  lng: number;
  Mylat: number;
  Mylng: number;
  km = 1;
  desactivada: boolean;
  existe: boolean;
  toast: any;
  toaswaspresent: boolean;
  constructor(
    private geolocation: Geolocation,
    public modalController: ModalController,
    public alertController: AlertController,
    public toastController: ToastController,
    private vibration: Vibration,
    private nativeAudio: NativeAudio,
    // private localNotifications: LocalNotifications,
    private platform: Platform
    // private backgroundGeolocation: BackgroundGeolocation
  ) {
    if ( this.platform.is('mobile')) {
          // Schedule a single notification
    // this.localNotifications.schedule({
    //   id: 1,
    //   text: 'Single ILocalNotification',
    //   // sound: isAndroid? 'file://sound.mp3': 'file://beep.caf',
    //   data: { secret: 'Hola Mundo' }
    // });
    this.nativeAudio.preloadSimple('m1', 'assets/music/alarm-clock.mp3').then(() => {
      console.log('Music preloaded');
      this.CargarData();
      this.GetUbication();

    });
    return;
    }
      this.CargarData();
      this.GetUbication();


  }
  ExisteAlarma() {
    (this.km && this.Mylat && this.Mylng && this.lat && this.lng) ? this.existe = true : this.existe = false;
  }
  GetUbication () {
      const watch = this.geolocation.watchPosition();
      watch.subscribe(data => {
        this.Mylat = data.coords.latitude;
        this.Mylng = data.coords.longitude;
        this.GuardarData();
        this.presentToast();
        this.ExisteAlarma();
        // tslint:disable-next-line:max-line-length
        if ( (Number(this.calcular_distancia(data.coords.latitude, data.coords.longitude, this.lat, this.lng)) <= this.km && !this.desactivada)) {
          this.nativeAudio.play('m1').then(() => {
            this.presentAlert(1);
            this.vibration.vibrate(10000);
          });

        }
      });
      // Backgroud
      // const config: BackgroundGeolocationConfig = {
      //   desiredAccuracy: 10,
      //   stationaryRadius: 20,
      //   distanceFilter: 30,
      //   debug: true, //  enable this hear sounds for background-geolocation life-cycle.
      //   stopOnTerminate: false, // enable this to clear background location settings when the app terminates
      //   };
      //   this.backgroundGeolocation.configure(config)
      //   .then(() => {
      //     this.backgroundGeolocation.on('location').subscribe((location: BackgroundGeolocationResponse) => {
      //       console.log(location);
      //     });
      //   });
    }
  CargarData() {
    this.km = Number(localStorage.getItem('km')) || this.km;
    this.Mylng = Number(localStorage.getItem('MyLng')) || this.Mylng;
    this.Mylat = Number(localStorage.getItem('Mylat')) || this.Mylat;
    this.lat = Number(localStorage.getItem('lat')) || this.lat;
    this.lng = Number(localStorage.getItem('lng')) || this.lng;
    this.desactivada = Boolean(localStorage.getItem('desactivada')) || this.desactivada;
  }
  GuardarData() {
    localStorage.setItem('km', JSON.stringify(this.km));
    localStorage.setItem('MyLat', JSON.stringify(this.Mylat));
    localStorage.setItem('MyLng', JSON.stringify(this.Mylng));
    localStorage.setItem('lng', JSON.stringify(this.lng));
    localStorage.setItem('lat', JSON.stringify(this.lat));
    localStorage.setItem('desactivada', JSON.stringify(this.desactivada));
  }
  borrarData() {
    localStorage.removeItem('km');
    localStorage.removeItem('MyLat');
    localStorage.removeItem('MyLng');
    localStorage.removeItem('lng');
    localStorage.removeItem('lat');
    localStorage.removeItem('desctivada');
    this.existe = false;
    this.lat = undefined;
    this.lng = undefined;
    this.toastController.dismiss(this.toast);
    this.toastController.dismiss(this.toast);
    this.toaswaspresent = false;
  }
  clickMap(event) {
    if (this.existe ) { return; }
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    if (Number(this.calcular_distancia(this.Mylat, this.Mylng, this.lat, this.lng)) >= .01 ) { this.presentAlertPrompt(); }
  }
  async presentAlert(option: number) {
    const alert = await this.alertController.create({
      header: option === 1 ? 'Levantate!' : 'Alarma Guardada',
      subHeader: option === 1 ? 'Estas cerca de tu destino.' : 'Se guardo la informacion de la alarma.',
      message: option === 1 ? 'Estas a ' + this.calcular_distancia(this.Mylat, this.Mylng, this.lat, this.lng) + 'km de tu destino.' : '',
      buttons: ['OK']
    });
    option === 1 ? this.desactivada = true : this.desactivada = false;
    if ( option === 1) {
      this.nativeAudio.stop('m1');
      this.nativeAudio.unload('m1');
      // this.backgroundGeolocation.stop();
    }
    await alert.present();
  }
  async presentAlertMultipleButtons() {
    const alert = await this.alertController.create({
      header: '¿Estas seguro de borrar la alarma?',
      subHeader: 'Se borrara la configuración.',
      message: '',
      buttons: [{
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }, {
          text: 'Ok',
          handler: (data) => {
           this.borrarData();
          }
        }]
    });

    await alert.present();
  }
  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: '¿Estas seguro guardar alarma?',
      inputs: [
        {
          name: 'name1',
          type: 'text',
          placeholder: 'Distancia minima (km)'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.km = Number( data.name1) || .01;
            this.existe = true;
            this.desactivada = false;
            this.GuardarData();
            this.presentToast();
            this.presentAlert(2);
          }
        }
      ]
    });

    await alert.present();
  }
  async presentToast() {
    if (this.toaswaspresent) { return; }
    if (!this.existe) { return; }
    this.toast = await this.toastController.create({
      position: 'top',
      color: 'dark',
      // tslint:disable-next-line:max-line-length
      message: 'Existe una alarma activa!, faltan ' + this.calcular_distancia(this.Mylat, this.Mylng, this.lat, this.lng) + 'km para llegar.',
    });
    this.toaswaspresent = true;
    this.toast.present();
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: MyComponentComponent,
      componentProps: { value: 123 }
    });
    return await modal.present();
  }
  calcular_distancia(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6378.137;
    const dLat = this.rad(lat2 - lat1);
    const dLong = this.rad(lon2 - lon1);
    // tslint:disable-next-line:max-line-length
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.rad(lat1)) * Math.cos(this.rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    d = d  * 1;
    return d.toFixed(3);
  }
  rad(x: number) {
    return x * Math.PI / 180;
  }
}
