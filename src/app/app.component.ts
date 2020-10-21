import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { timer } from "rxjs";
import { formatNumber } from "@angular/common";

class GetalIteratie {
  constructor(public aantal: number, public cijfers: number) {
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit  {
  public title = 'pws-app';
  public interaties = [new GetalIteratie(2, 4), new GetalIteratie(2, 6)];
  public randomGetal: number;
  public invoerGetal: number;
  public getallen = [];
  public showGetal: boolean = true;
  public showInput: boolean = false;
  private getalTimer;

  constructor(private elementRef: ElementRef){
    // We doen hier niks. elementRef is een koppeling van de code met de html pagina elementen
    // Zodoende kunnen we de achtergrondkleur op rood of groen zetten
  }

  public ngOnInit() {
    this.showGetal = true;
    this.showInput = false;
  }

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'default';
  }

  public nieuwGetal(cijfers: number) {
    this.showGetal = true;
    this.showInput = false;
    this.getalTimer = timer(4000);
    this.randomGetal = this.getRandomGetal(cijfers);
    const subscribe = this.getalTimer.subscribe(val => {
      this.showGetal = false;
      this.showInput = true;
    });
  }

  /**
   * Math.random levert een getal tussen 0 en 1. Door dit getal * (max - min) + min te doen, krijg je een getal tussen min en max
   */
  getRandomGetal(cijfers: number) {
    return Math.round(Math.random() * (Math.pow(10, cijfers) - 1 - Math.pow(10, (cijfers - 1))) + Math.pow(10, (cijfers - 1)));
  }

  onInputGetal() {
    console.log(this.invoerGetal)
    this.showInput = false;
    this.showGetal = true;

    if (this.randomGetal !== this.invoerGetal) {
      this.flashWindow();

    }
  }

  flashWindow() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'red';
    const flashTimer = timer(500);
    const subscribe = flashTimer.subscribe( value => {
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'white';
    })
  }

}
