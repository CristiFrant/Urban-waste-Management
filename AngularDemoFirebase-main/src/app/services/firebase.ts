import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

// Interfața originală pentru teste simple
export interface IDatabaseItem {
    name: string;
    val: string;
}

// Interfața nouă pentru Punctele de Colectare (Harta ArcGIS)
export interface IPunctColectare {
    nume: string;
    adresa: string;
    telefon?: string;
    program?: string;
    zileLucrate?: string;
    descriere?: string;
    latitudine: number;
    longitudine: number;
    // Categorii pentru Filtrare
    plastic: boolean;
    hartie: boolean;
    carti: boolean;
    sticla: boolean;
    metal: boolean;
    haine: boolean;
    electronice: boolean;
    electrocasnice: boolean;
    ochelari: boolean;
    baterii: boolean;
    vapes: boolean;
    vopsea: boolean;
    automobile: boolean;
    antigel: boolean;
    ulei: boolean;
    moloz: boolean;
}

@Injectable({
    providedIn: 'root' // Asigură că serviciul este disponibil în toată aplicația
})
export class FirebaseService {

    listFeed: Observable<any[]>;
    objFeed: Observable<any>;
    // Feed nou pentru hartă
    puncteColectareFeed: Observable<any[]>;

    constructor(public db: AngularFireDatabase) { }

    connectToDatabase() {
        this.listFeed = this.db.list('list').valueChanges();
        this.objFeed = this.db.object('obj').valueChanges();
        // Conectăm și feed-ul pentru punctele de colectare
        this.puncteColectareFeed = this.db.list('puncteColectare').valueChanges();
    }

    getChangeFeedList() {
        return this.listFeed;
    }

    // Metodă nouă pentru a obține feed-ul punctelor pe hartă
    getChangeFeedPuncte() {
        return this.puncteColectareFeed;
    }

    // Adaugă un punct de colectare complet (JSON) în Firebase
    addPunctColectare(punct: IPunctColectare) {
        // Conversie forțată la număr pentru coordonate (important pentru ArcGIS)
        const dataToSave = {
            ...punct,
            latitudine: Number(punct.latitudine),
            longitudine: Number(punct.longitudine)
        };
        return this.db.list('puncteColectare').push(dataToSave);
    }

    // Funcție de curățare a bazei de date (Faza 6)
    removePuncteColectare() {
        return this.db.list('puncteColectare').remove();
    }

    // --- METODELE ORIGINALE (Păstrate pentru compatibilitate) ---

    removeListItems() {
        this.db.list('list').remove();
    }

    addListObject(val: string) {
        let item: IDatabaseItem = {
            name: "test",
            val: val
        };
        this.db.list('list').push(item);
    }

    getPuncteColectare(): Observable<any[]> {
        return this.db.list('puncteColectare').valueChanges();
    }
}