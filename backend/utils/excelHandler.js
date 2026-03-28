const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class ExcelHandler {
  constructor(filename) {
    this.filepath = path.join(DATA_DIR, filename);
    this.initializeFile();
  }

  initializeFile() {
    if (!fs.existsSync(this.filepath)) {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, this.filepath);
    }
  }

  readData() {
    try {
      const workbook = XLSX.readFile(this.filepath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      return data;
    } catch (error) {
      console.error(`Error reading ${this.filepath}:`, error);
      return [];
    }
  }

  writeData(data) {
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, this.filepath);
      return true;
    } catch (error) {
      console.error(`Error writing to ${this.filepath}:`, error);
      return false;
    }
  }

  findById(id, idField = 'id') {
    const data = this.readData();
    return data.find(item => item[idField] == id);
  }

  findAll(filter = {}) {
    const data = this.readData();
    if (Object.keys(filter).length === 0) return data;
    
    return data.filter(item => {
      return Object.keys(filter).every(key => item[key] == filter[key]);
    });
  }

  create(newItem) {
    const data = this.readData();
    data.push(newItem);
    return this.writeData(data);
  }

  update(id, updatedItem, idField = 'id') {
    const data = this.readData();
    const index = data.findIndex(item => item[idField] == id);
    
    if (index === -1) return false;
    
    data[index] = { ...data[index], ...updatedItem };
    return this.writeData(data);
  }

  delete(id, idField = 'id') {
    const data = this.readData();
    const filteredData = data.filter(item => item[idField] != id);
    
    if (filteredData.length === data.length) return false;
    
    return this.writeData(filteredData);
  }

  count() {
    return this.readData().length;
  }
}

module.exports = ExcelHandler;

