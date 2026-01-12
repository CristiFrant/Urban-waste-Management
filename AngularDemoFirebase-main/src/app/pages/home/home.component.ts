import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { FirebaseService, IDatabaseItem } from "src/app/services/firebase";
import { SuperheroFactoryService } from "src/app/services/superhero-factory";
import config from "@arcgis/core/config";

// Importuri ArcGIS și CSV
import * as locator from "@arcgis/core/rest/locator";
import Point from "@arcgis/core/geometry/Point";
import * as Papa from 'papaparse';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

    // --- VARIABILE DIN PROIECTUL COMPLEX ---
    csvData: any[] = []; 
    currentIndex: number = 0; 
    usedIndexes: Set<number> = new Set<number>();
    
    // Configurare ArcGIS Locator
    private locatorUrl = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";
    magazineGasite: any[] = [];

    // Firebase sync original
    isConnected: boolean = false;
    subscriptionList: Subscription;
    subscriptionObj: Subscription;
    listItems: any[] = [];

    constructor(
        private fbs: FirebaseService,
        private sfs: SuperheroFactoryService
    ) {}

    ngOnInit() {
        this.connectFirebase();
    }

    connectFirebase() {
        if (this.isConnected) return;
        this.isConnected = true;
        this.fbs.connectToDatabase();
        this.subscriptionList = this.fbs.getChangeFeedList().subscribe((items: any[]) => {
            this.listItems = items;
        });
    }

    // --- LOGICA DE IMPORT COMPLEXĂ (Preluată din model) ---

    /**
     * Încarcă și parsează fișierul CSV în memorie, mapând toate categoriile de reciclare
     */
    loadCSV(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result as string;
            Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    this.csvData = result.data.map((row: any) => ({
                        nume: row.Nume || row.name || 'Necunoscut',
                        plastic: row.Plastic === 'Da' || row.plastic === true,
                        hartie: row.Hartie === 'Da' || row.hartie === true,
                        carti: row.Carti === 'Da' || row.carti === true,
                        sticla: row.Sticla === 'Da' || row.sticla === true,
                        metal: row.Metal === 'Da' || row.metal === true,
                        haine: row.Haine === 'Da' || row.haine === true,
                        electronice: row.Electronice === 'Da' || row.electronice === true,
                        electrocasnice: row.Electrocasnice === 'Da' || row.electrocasnice === true,
                        ochelari: row.Ochelari === 'Da' || row.ochelari === true,
                        baterii: row.Baterii === 'Da' || row.baterii === true,
                        vapes: row.Vapes === 'Da' || row.vapes === true,
                        vopsea: row.Vopsea === 'Da' || row.vopsea === true,
                        automobile: row.Automobile === 'Da' || row.automobile === true,
                        antigel: row.Antigel === 'Da' || row.antigel === true,
                        ulei: row.Ulei === 'Da' || row.ulei === true,
                        moloz: row.Moloz === 'Da' || row.moloz === true,
                        telefon: row.Telefon || row.phone || 'N/A',
                        zileLucrate: row.ZileLucrate || 'N/A',
                        program: row.Program || 'N/A',
                        adresa: row.Adresa || row.address || 'N/A',
                        latitudine: parseFloat(row.Latitudine || row.lat) || 0,
                        longitudine: parseFloat(row.Longitudine || row.long) || 0,
                        descriere: row.Descriere || 'N/A'
                    }));
                    console.log('Date CSV încărcate:', this.csvData);
                    alert(`CSV încărcat! ${this.csvData.length} rânduri gata de procesare.`);
                }
            });
        };
        reader.readAsText(file);
    }

    /**
     * Adaugă un singur item în Firebase bazat pe indexul curent
     */
    addListItem() {
        if (this.csvData.length === 0) {
            // Dacă nu avem CSV încărcat, folosim comportamentul vechi cu supereroi
            let newItemValue = this.sfs.getName();
            this.fbs.addListObject(newItemValue);
            return;
        }

        if (this.currentIndex < this.csvData.length) {
            if (this.usedIndexes.has(this.currentIndex)) {
                this.currentIndex++;
                this.addListItem();
                return;
            }

            const newRow = this.csvData[this.currentIndex];
            this.fbs.addPunctColectare(newRow); // Trimite obiectul complex către Firebase
            this.usedIndexes.add(this.currentIndex);
            this.currentIndex++;
        } else {
            alert("Toate datele din CSV au fost adăugate!");
        }
    }

    /**
     * Adaugă toate elementele rămase din CSV
     */
    addAllRemainingItems() {
        let addedCount = 0;
        this.csvData.forEach((row, i) => {
            if (!this.usedIndexes.has(i)) {
                this.fbs.addPunctColectare(row);
                this.usedIndexes.add(i);
                addedCount++;
            }
        });
        alert(`${addedCount} puncte noi au fost adăugate în Firebase.`);
    }

    /**
     * Permite setarea manuală a punctului de plecare pentru import
     */
    setCustomIndex() {
        const input = prompt("Introdu indexul de la care să înceapă adăugarea:");
        const parsedIndex = parseInt(input || '', 10);
        if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < this.csvData.length) {
            this.currentIndex = parsedIndex;
        }
    }

    // --- ALTE FUNCȚIONALITĂȚI ADMIN ---

    clearAllData() {
        if (confirm('Ești sigur că vrei să ștergi toate locațiile?')) {
            this.fbs.removePuncteColectare();
            this.listItems = [];
            this.currentIndex = 0;
            this.usedIndexes.clear();
        }
    }

    removeItems() {
        this.fbs.removeListItems();
    }

    // --- LOGICA ARCGIS LOCATOR (Păstrată pentru utilitate) ---
    gasesteMagazine() {
        config.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurKE-LqnQJv5ZftEj6_bxNtQG6vNR3GkqjbvMOicmrThaxVKq5kAQ9sy5gihvr9_2fjkcUNuqBkdTPsUIK9mc8flhJL0R_Yo7u4f-rMBv0sGf9szVhDXnL_iWa35KmYKWXMOWTkiQLbMc0Xn6V3U_7KU-r5JzNslkBIptJ0SEomLRV91NMvvzcDEaNN_87Z09W4KVJCswjpJGvir4dS73otw.AT1_MwiabmZ1";
        const punctTest = new Point({ longitude: 26.1025, latitude: 44.4268 });

        locator.addressToLocations(this.locatorUrl, {
            address: { "address": "" },
            location: punctTest,
            categories: ["Food", "Shop and Service"],
            maxLocations: 50,
            outFields: ["PlaceName", "Place_addr"]
        }).then((results) => {
            this.magazineGasite = results.map(res => ({
                name: res.attributes.PlaceName || "Magazin",
                address: res.attributes.Place_addr || "N/A",
                lat: res.location.y,
                long: res.location.x,
                status: "Activ"
            }));
            alert(`S-au găsit ${this.magazineGasite.length} magazine.`);
        });
    }

    descarcaCSV() {
        const csv = Papa.unparse(this.magazineGasite);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'magazine_locator.csv';
        a.click();
    }

    disconnectFirebase() {
        if (this.subscriptionList) this.subscriptionList.unsubscribe();
        if (this.subscriptionObj) this.subscriptionObj.unsubscribe();
    }

    ngOnDestroy(): void {
        this.disconnectFirebase();
    }
}