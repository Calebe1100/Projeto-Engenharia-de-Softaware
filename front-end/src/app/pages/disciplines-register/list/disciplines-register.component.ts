import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { fork } from 'child_process';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { DisciplineService } from 'src/services/api/disciplines/discipline.service';
import {
  Discipline,
  DisciplineStatus,
} from 'src/services/api/disciplines/interface/Discipline';
import { UpdateDisciplineRequest } from 'src/services/api/disciplines/interface/UpdateDisciplineRequest';
import { AuthService } from 'src/services/api/login/auth.service';
import { SystemDiscipline } from 'src/services/api/system-disciplines/interface/SystemDiscipline';
import { SystemDisciplinesService } from 'src/services/api/system-disciplines/system-discipline.service';
import { CookieService } from 'src/services/shared/cookieService';
import { DialogDisciplinesComponent } from '../../dialog/dialog-disciplines/dialog-disciplines.component';

@Component({
  selector: 'app-disciplines-register',
  templateUrl: './disciplines-register.component.html',
  styleUrls: ['./disciplines-register.component.scss'],
})
export class DisciplinesRegisterComponent implements OnInit {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  discipline: boolean = false;
  listDiscipline: SystemDiscipline[] = [];
  filterListDiscipline: SystemDiscipline[] = [];

  listDisciplineSelected: SystemDiscipline[] = [];

  tablestyle = 'bootstrap';

  listUserDiscipline: Discipline[] = [];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  dateTime = '';

  constructor(
    public dialog: MatDialog,
    private readonly systemDisciplinesService: SystemDisciplinesService,
    private readonly disciplineService: DisciplineService,
    public readonly authService: AuthService,
    private readonly cookieService: CookieService
  ) {
    this.selected.push(this.filterListDiscipline[2]);

    this.dateTime = moment().format('MM/DD/YYYY HH:mm');
  }

  selected: SystemDiscipline[] = [];

  ngOnInit(): void {
    const idUser = this.cookieService.getCookie('id');

    forkJoin([
      this.disciplineService.listUserDiscipline(idUser.toString()),
      this.systemDisciplinesService.listSystemDisciplines(),
    ]).subscribe((results) => {
      this.listUserDiscipline = (results[0].list as Discipline[]);
      this.listDiscipline = (results[1].list as SystemDiscipline[]).filter(
        (discipline) =>
        this.listUserDiscipline.map(
            (d) => discipline.id == d.idDiscipline
          )
      );
      this.setStatus();
      this.filterListDiscipline = this.listDiscipline;
    });
  }

  setStatus() {
    this.listDiscipline = this.listDiscipline.map(
      (discipline: SystemDiscipline) => {
        return {
          ...discipline,
          status: 'Não iniciado',
          descriptionDiscipline:
            discipline.typeDiscipline === 1 ? 'Obrigatória' : 'Optativa',
            idCourseDiscipline: this.listUserDiscipline.find(d => d.idDiscipline === discipline.id)?.id
          
        };
      }
    ) as unknown as SystemDiscipline[];
  }
  get displayDisciplinesList(): boolean {
    return true;
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  openDialog() {
    let dialogRef = this.dialog.open(DialogDisciplinesComponent);
    dialogRef.componentInstance.listDiscipline = this.listDiscipline;
  }

  async updateResults() {
    this.listDiscipline = this.searchByValue();
  }

  searchByValue() {
    return this.filterListDiscipline.filter((item) => {
      if (this.searchInputControl.value.trim() === '') {
        this.filterListDiscipline = this.listDiscipline;
        return true;
      } else {
        return (
          item.name
            .toLowerCase()
            .includes(
              this.searchInputControl.value.trim().toLocaleLowerCase()
            ) ||
          item.name
            .toLowerCase()
            .includes(this.searchInputControl.value.trim().toLocaleLowerCase())
        );
      }
    });
  }

  onSelect(disciplineSelected: SystemDiscipline) {
    if (
      this.listDisciplineSelected.some(
        (discipline) => discipline.id == disciplineSelected.id
      )
    ) {
      this.listDisciplineSelected = this.listDisciplineSelected.filter(
        (discipline) => discipline.id !== disciplineSelected.id
      );
    } else {
      this.listDisciplineSelected.push(disciplineSelected);
    }
  }

  isRowSelected(id: string) {
    return false;
  }

  emitCompleted() {
    this.disciplineService
      .updateDisciplinesStatus(
        this.formattedListToRequest(DisciplineStatus.completed)
      )
      .subscribe(() => window.location.reload);
  }

  emitStudying() {
    this.disciplineService
      .updateDisciplinesStatus(
        this.formattedListToRequest(DisciplineStatus.studying)
      )
      .subscribe(() => window.location.reload);
  }

  formattedListToRequest(status: DisciplineStatus): UpdateDisciplineRequest[] {
    return this.listDisciplineSelected.map((discipline) => {
      return {
        status: status,
        id: discipline.idCourseDiscipline
      } as UpdateDisciplineRequest;
    });
  }
}
