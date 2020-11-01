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

  public toString = (): string => {
    return this.groep + ', ' + this.cijfers + ', ' + this.isGoed + ',\n'
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
  public aantalVragen = [4, 5, 6, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  private vraagCounter: number = 0;

  public randomGetal: number;
  public invoerGetal: number;
  public resultaat: Resultaat[] = [];

  public showUitleg: boolean = true;
  public showGetal: boolean = true;
  public showInput: boolean = false;
  public showButton: boolean = false;
  public buttonText = 'oefen';
  public uitlegText = '<p>Bedankt dat je mee wilt doen aan dit onderzoek voor ons profielwerkstuk. Lees de uitleg goed door voor je begint.</p>' +
    '<p>Als je op de \'oefen\' knop klikt zal je een getal te zien krijgen. Probeer deze zo goed mogelijk te onthouden. Hiervoor heb je een aantal seconden te tijd.</p>' +
    '<p>Het getal zal verdwijnen. Probeer nu exact hetzelfde getal als dat je eerder zag weer in te voeren in het invoerbalkje.</p>' +
    '<p>Zodra je op enter drukt ga je gelijk naar de volgende vraag.</p>' +
    '<p>Druk op de \'oefen\' knop om te beginnen met de 3 oefenvragen.</p>';
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
      });
    console.log("Groep = ", this.groep);
    this.showGetal = false;
    this.showInput = false;
    this.showButton = true;
    this.vraagCounter = 0;
  }

  public start() {
    this.showButton = false;
    this.showUitleg = false;
    this.nieuwGetal()
  }


  // AfterViewInit implemented methode
  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'default';
  }

  public nieuwGetal() {
    this.randomGetal = this.getRandomGetal(this.aantalVragen[this.vraagCounter]);
    this.invoerGetal = null;
    this.showGetal = true;
    this.showInput = false;
    this.getalTimer = timer(6000);
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
    var min = Math.pow(10, cijfers - 1); // 10 ^ (4 - 1) = 1000
    var max = Math.pow(10, cijfers) - 1; // 10 ^ 4 - 1 = 10.000 - 1 = 9999
    return Math.floor(Math.random() * (max - min) + min);
  }

  /**
   * Wanneer er een getal is ingevoerd (beeindigd met <enter>), dan wordt deze functie aangeroepen
   */
  onInputGetal() {
    console.log('Cijfers: ' + this.aantalVragen[this.vraagCounter]);
    console.log('Random getal: ' + this.randomGetal);
    console.log('Ingevoerd: ' + this.invoerGetal)
    console.log('Counter: ' + this.vraagCounter);
    console.log('Resultaat: ' + this.resultaat);
    this.showInput = false;
    this.showGetal = true;

    this.resultaat.push(
      new Resultaat(
        this.identificatie,
        this.groep,
        this.aantalVragen[this.vraagCounter],
        (this.randomGetal === this.invoerGetal) ? 1 : 0))
    if (this.groep == Groep.ROOD && this.randomGetal !== this.invoerGetal) {
      this.flashWindow('red');
    }
    if (this.groep == Groep.GROEN && this.randomGetal === this.invoerGetal) {
      this.flashWindow('green');
    }
    // Het proefrondje stopt na 3 getallen (we tellen vanaf 0)
    if (this.vraagCounter == 2) {
      this.uitlegText = '<p>Je hebt de oefenvragen afgerond.</p>' +
        '<p>Nu ga je beginnen met de echte test. Deze werkt hetzelfde als de oefentest.</p>' +
        '<p>Druk op \'start\' om te beginnen. Je zal weer een getal te zien krijgen. Probeer deze zo goed mogelijk te onthouden. Hiervoor heb je een aantal seconden te tijd.</p>' +
        '<p>Het getal zal verdwijnen. Probeer nu exact hetzelfde getal als dat je eerder zag weer in te voeren in het invoerbalkje.</p>' +
        '<p>Zodra je op enter drukt ga je gelijk naar de volgende vraag.</p>' +
        '<p>De echte test bevat 9 vragen. Het aantal cijfers zal oplopen. Doe gewoon zo goed mogelijk je best. Druk op \'start\' om te beginnen met de test.</p>';
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
      this.uitlegText = '<p>Heel erg bedankt voor het meedoen aan ons onderzoek!</p>' +
        '<p>Dit was alles wat we van je nodig hebben. Je kunt het tabblad nu sluiten.</p>';
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
