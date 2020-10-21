import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { timer } from "rxjs";
import { ActivatedRoute } from "@angular/router";

class GetalIteratie {
  constructor(public aantal: number, public cijfers: number) {
  }
}

class Resultaat {
  constructor(public cijfers: number, isGoed) {}
}

enum Groep {
  GEEN,
  ROOD,
  GROEN
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  public title = 'pws-app';
  public iteraties = [new GetalIteratie(2, 4), new GetalIteratie(2, 6)];
  public randomGetal: number;
  public invoerGetal: number;
  public getallen = [];
  public showGetal: boolean = true;
  public showInput: boolean = false;
  private getalTimer;
  // De groep waartoe de respondent behoort (0=GEEN, 1=ROOD, 2=GROEN)
  private groep: Groep;

  constructor(private elementRef: ElementRef, private route: ActivatedRoute) {
    // We doen hier niks. elementRef is een koppeling van de code met de html pagina elementen
    // Zodoende kunnen we de achtergrondkleur op rood of groen zetten
  }

  public ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        this.groep = params.groep;
      });
    // FIXME: met ?groep=1 wordt this.groep nog niet gezet
    console.log("Groep = ", this.groep);
    this.showGetal = true;
    this.showInput = false;
    // TODO: Hoe moeten we loopen over this.iteraties?
    this.nieuwGetal(4);
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
    const subscribe = flashTimer.subscribe(value => {
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'white';
    })
  }

}
