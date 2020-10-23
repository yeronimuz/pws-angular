import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { timer } from "rxjs";
import { ActivatedRoute } from "@angular/router";

/**
 * Sla het resultaat op
 */
class Resultaat {
  constructor(public identificatie: string,
              public groep: number,
              public cijfers: number,
              public isGoed: number) {}
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
  public identificatie
  public aantalVragen = [4, 4, 6, 6];
  private vraagCounter: number = 0;
  public randomGetal: number;
  public invoerGetal: number;
  public resultaat: Resultaat[] = [];
  public showGetal: boolean = true;
  public showInput: boolean = false;
  private getalTimer;
  // De groep waartoe de respondent behoort (0=GEEN, 1=ROOD, 2=GROEN)
  private groep: Groep;

  constructor(private route: ActivatedRoute, private elementRef: ElementRef) {
    // We doen hier niks. elementRef is een koppeling van de code met de html pagina elementen
    // Zodoende kunnen we de achtergrondkleur op rood of groen zetten
  }

  // OnInit implemented methode
  public ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        console.log(params);
        this.groep = params.groep;
        this.identificatie = params.identificatie;
      });
    console.log("Groep = ", this.groep);
    this.showGetal = true;
    this.showInput = false;
    this.vraagCounter = 0;
    // TODO: Hoe moeten we loopen over this.iteraties?
    this.nieuwGetal();
  }

  // AfterViewInit implemented methode
  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'default';
  }

  public nieuwGetal() {
    this.showGetal = true;
    this.showInput = false;
    this.getalTimer = timer(4000);
    this.randomGetal = this.getRandomGetal(this.aantalVragen[this.vraagCounter]);
    this.getalTimer.subscribe(val => {
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

    this.resultaat.push(
      new Resultaat(
        this.identificatie,
        this.groep,
        this.aantalVragen[this.vraagCounter],
        (this.randomGetal === this.invoerGetal) ? 1 : 0))
    console.log(this.vraagCounter);
    console.log(this.resultaat);
    this.flashWindow();
  }

  /**
   * Functie voor het flashen van het window. Na het flashen gaat het programma door met het volgende nieuwe getal
   * Het flitsen gaat met rood, groen of het kleur van het window. Het flitsen gebeurt dus altijd.
   */
  flashWindow() {
    let color = 'default';
    if (this.groep == Groep.ROOD) {
      color = 'red';
    } else if (this.groep == Groep.GROEN) {
      color = 'green';
    }
    if (this.randomGetal !== this.invoerGetal) {
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = color;
      const flashTimer = timer(100);
      flashTimer.subscribe(value => {
        this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'white';
        if (this.vraagCounter < this.aantalVragen.length - 1) {
          this.vraagCounter++;
          this.invoerGetal = null;
          this.nieuwGetal();
        } else {
          // Klaar, toon een bedankje en stuur de antwoorden op
          console.log('Klaar');
          console.log(this.resultaat);
          // TODO: showDank()
          // TODO: sendEmail()
        }
      })
    } else {
      // Het getal was goed, volgende getal
      this.vraagCounter++;
      this.invoerGetal = null;
      this.nieuwGetal()
    }
  }
}
