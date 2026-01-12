import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { ISesizare } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private dbPath = '/sesizari';
  sesizariRef: AngularFireList<ISesizare>;

  constructor(private db: AngularFireDatabase) {
    this.sesizariRef = db.list(this.dbPath);
  }

  getAllSesizari() {
    return this.sesizariRef.valueChanges(); 
  }

  addSesizare(sesizare: ISesizare): any {
    return this.sesizariRef.push(sesizare);
  }

  updateStatus(key: string, statusNou: 'rezolvat' | 'in_lucru'): Promise<void> {
    return this.sesizariRef.update(key, { status: statusNou });
  }
}