import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { timer } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";

/**
 * Sla het resultaat op
 */
class Resultaat {
  constructor(public identificatie: string,
              public groep: number,
              public cijfers: number,
              public isGoed: number) {}
  public toString = () : string => {
    return '{' + this.identificatie + ', ' + this.groep + ', ' + this.cijfers + ', ' + this.isGoed + '}'
  }
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

  public showUitleg: boolean = true;
  public showGetal: boolean = true;
  public showInput: boolean = false;
  public showButton: boolean = false;
  public buttonText = 'oefen';
  public uitlegText = 'Druk op oefen voor een oefenrondje';
  private getalTimer;
  // De groep waartoe de respondent behoort (0=GEEN, 1=ROOD, 2=GROEN)
  private groep: Groep;

  constructor(private route: ActivatedRoute, private elementRef: ElementRef, private httpClient: HttpClient) {
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
    this.showGetal = false;
    this.showInput = false;
    this.showButton = true;
    this.vraagCounter = 0;
  }

  public start()
  {
    this.showButton = false;
    this.showUitleg = false;
    this.nieuwGetal()
  }


  // AfterViewInit implemented methode
  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'default';
  }

  public nieuwGetal() {
    this.invoerGetal = null;
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
   * Het getal ligt dus in de range: 10^3 .. 10^4 - 1 waarbij hier cijfers = 4
   */
  getRandomGetal(cijfers: number) {
    return Math.round(Math.random() * (Math.pow(10, cijfers) - 1 - Math.pow(10, (cijfers - 1))) + Math.pow(10, (cijfers - 1)));
  }

  /**
   * Wanneer er een getal is ingevoerd (beeindigd met <enter>), dan wordt deze functie aangeroepen
   */
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
    // We roepen flashWindow aan ook als er niet geflashed moet worden.
    // Dit is omdat het vervolg van de software in de flashWindow zit
    if (this.groep == Groep.ROOD && this.randomGetal !== this.invoerGetal) {
      this.flashWindow('red');
    }
    if (this.groep == Groep.GROEN && this.randomGetal === this.invoerGetal) {
      this.flashWindow('green');
    }
    // Het proefrondje stopt na 2 getallen (0, 1)
    if (this.vraagCounter == 1)
    {
      this.uitlegText = 'Je hebt nu een proefrondje gedaan, klik op start voor de test';
      this.showUitleg = true;
      this.buttonText = 'start'
      this.showButton = true;
      this.showGetal = false;
      this.showInput = false;
    } else if (this.vraagCounter < this.aantalVragen.length - 1) {
      this.showGetal = true;
      this.showButton = false;
      this.nieuwGetal();
    } else {
      // Klaar, toon een bedankje en stuur de antwoorden op
      this.invoerGetal = null;
      this.showInput = false;
      this.showGetal = false;
      this.showButton = false;
      this.uitlegText = 'Bedankt voor het meedoen aan deze test. Je mag je browser venster sluiten'
      this.showUitleg = true;
      this.stuurResultaatOp();
    }
    this.vraagCounter++;
  }

  /**
   * Functie voor het flashen van het window.
   */
  private flashWindow(color: string) {
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = color;
      const flashTimer = timer(20);
      flashTimer.subscribe(value => {
        this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'white';
      })
  }

  /**
   * Stuur de antwoorden op via formspree mail backend
   */
  private stuurResultaatOp() {
    const email = this.resultaat.toString();
    const headers = { 'Content-Type': 'application/json' };
    this.httpClient.post('https://formspree.io/f/mdopgble',
      { name: 'jeroen@lankheet.com', replyto: 'jeroen@lankheet.org', message: email },
      { 'headers': headers }).subscribe(
      response => {
        console.log(response);
      }
    );
  }
}
