import { Component, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  action: string;
  region: string;
  output: string;
  profile: string;
}
  
@Component({
  selector: 'app-aws-client-dialog',
  templateUrl: 'aws-client-dialog.component.html',
})
export class AwsClientDialogComponent {
  constructor(public dialogRef: MatDialogRef<AwsClientDialogComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
  
  onNoClick(): void {
    this.dialogRef.close();
  }
}
