// pengelolaan contacts 

const fs = require("fs");

// cek folder data jika belum ada
const lokasi = "./data";
if(!fs.existsSync(lokasi)){
    fs.mkdirSync(lokasi);
}

// cek file contacts.json jika belum ada
const lokasiFile = "./data/contacts.json";
if(!fs.existsSync(lokasiFile)){
    fs.writeFileSync(lokasiFile, '[]');
}

// membaca isi dari file contact.json
const ambilDataKontak = () =>{
    const fileJSON = JSON.parse(fs.readFileSync("data/contacts.json","utf-8"));
    return fileJSON;
}

// cari kontak berdasarkan nama (yang didapat dari parameter)
const cariKontak = (nama) =>{
    const contacts = ambilDataKontak();
    // cari kontak menggunakan method find, contacts disini posisinya adalah sebuah array of objects
    const contact = contacts.find((objekKontak) => objekKontak.nama === nama);
    return contact; // data yang dikirim dalam bentuk object dari anggota element array contacts
}

// method untuk menulis / menimpa file contacts.json dengan data yang baru
const simpanDaftarKontak = (contacts) =>{
    fs.writeFileSync("data/contacts.json", JSON.stringify(contacts));
}


// fungsi tambahKontak untuk menambahkan data kontak baru
const tambahKontak = (contact) =>{
    const contacts = ambilDataKontak();
    contacts.push(contact);
    simpanDaftarKontak(contacts);
}

// cek duplikat nama
const cekDuplikat = (nama) =>{
    const contacts = ambilDataKontak();
    return contacts.find(contact => contact.nama === nama)
    }

// hapus kontak
const hapusKontak = (nama)=>{
    const contacts = ambilDataKontak();
    const newContact = contacts.filter(contact => contact.nama !== nama);
    
    simpanDaftarKontak(newContact)
}

// ubah kontak
// tujuan lainnya adalah untuk menghapus property namaLama di data contact
const updateKontak = (kontakBaru) =>{ // kontakBaru adalah kontak yang lolos validasi (benar semua isinya)
     const contacts = ambilDataKontak();
     // hilangkan kontak lama yang namanya sama dengan namaLama
     const newContact = contacts.filter((contact) => contact.nama !== kontakBaru.namaLama); // akan ada array baru

     delete kontakBaru.namaLama; // hapus property namaLama agar sesuai dengan format data contacts.json
     newContact.push(kontakBaru);
     simpanDaftarKontak(newContact)
}

module.exports = {ambilDataKontak, cariKontak, tambahKontak, cekDuplikat, hapusKontak, updateKontak}