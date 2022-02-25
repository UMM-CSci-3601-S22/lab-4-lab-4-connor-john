import { fstat, readFile } from 'fs';

export class ReadFromFile {
  /*
   *A basic file reader object to enable loading large test files into strings
   *this should be helpful when we want to test that large text-boxes don't allow us to enter
   *absurdly long inputs.
  */

  private output: string;

  constructor(file: string) {
    readFile(file, 'utf-8', (err, data) => {
      if (err) {
        console.error(err);
      }
      this.output = data;
    });
  }

  read() {
    return this.output;
  }

  length() {
    return this.output.length;
  }
}
