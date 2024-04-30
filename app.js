const express = require("express"); // web app framework
const expressLayouts = require('express-ejs-layouts'); 
const app = express();
const port = 3000;
const {ambilDataKontak, cariKontak, tambahKontak, cekDuplikat, hapusKontak, updateKontak} = require("./utils/contacts")
const {body, validationResult, check} = require("express-validator")
// body untuk menangkap data dari form
// validationResult untuk menyimpan data validasi

// tiga modul di bawah ini dipakai untuk menggunakan fitur flash message
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");


// memberitahu express js bahwa kita akan menggunakan view engine ejs
app.set("view engine", "ejs"); // harus dibuat folder views yang menyimpan semua tampilan halaman web
// ejs memungkinkan kita untuk membuat file template statis untuk aplikasi kita (format file .ejs)

// Third party middleware
app.use(expressLayouts); // third party middleware ini memungkinkan untuk membuat sebuah satu file sebagai layout utama yang nantinya akan dipakai untuk semua halaman (main-layout.ejs)

// Built-in middleware
app.use(express.static("public")); // untuk membuat folder asset
app.use(express.urlencoded({extended: true})); // untuk parsing data yang ada di request body

// konfigurasi flash message
app.use(cookieParser("secret"));
app.use(session({
    cookie: {maxAge: 6000},
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

// routing
app.get("/",(request,response)=>{

    // request : apa yang dikirimkan ke express js
    // response: apa yang dikembalikan dari express js
    // memanggil halaman di dalam folder views
    // file index dll harus dalam ekstensi .ejs 
    // untuk mengirim data ke halaman web tsb menggunakan argumen object
    const contacts = ambilDataKontak(); 

    response.render("contact",{
        judul: "Halaman Contact",
        layout: "layouts/main-layout",
        // data contacts di atas akan dikirim ke file contact.ejs
        dataKontak : contacts,
        pesanSistem: request.flash("pesan") // menampilkan flash message
    })
})
    

// route contact
app.get("/contact",(request,response)=>{
    // mengambil data kontak dari modul lain
    const contacts = ambilDataKontak(); // isinya adalah object json

    response.render("contact",{
        judul: "Halaman Contact",
        layout: "layouts/main-layout",
        // data contacts di atas akan dikirim ke file contact.ejs
        dataKontak : contacts,
        pesanSistem: request.flash("pesan") // menampilkan flash message
    })
});

// halaman form tambah data kontak
app.get("/contact/tambahkontak", (request, response)=>{
    response.render("add-contact",{
        judul: "Form Tambah Data Kontak",
        layout: "layouts/main-layout"
    })
});

// memproses data kontak
// method post untuk menerima data kontak
app.post("/contact", 
[
    // validasi isian data form dari user
    body("nama").custom((inputNama)=>{
    const duplikat = cekDuplikat(inputNama);
    if(duplikat){
        throw new Error("Nama kontak sudah digunakan!");
    }
    return true;
    }),
    check("email","Email tidak valid").isEmail(),
    check("nomor", "Nomor handphone tidak valid").isMobilePhone("id-ID")
],(request, response)=>{
    // validasi data form
    const errors = validationResult(request);
    // jika ada error
    if(!errors.isEmpty()){
        // return response.status(400).json({errors: errors.array()});
        response.render("add-contact",{
            judul: "Form Tambah Data Kontak",
            layout: "layouts/main-layout",
            errors: errors.array()
        })
    }
    // jika tidak ada error
    else{
        tambahKontak(request.body); // dalam bentuk object
        // kirim pesan kilat
        request.flash("pesan","Data kontak berhasil ditambahkan.");
        response.redirect("/contact"); // menuju app.get("/contact")
    }
    // data yang dikirim dari form harus diparsing dulu menggunakan express.urlencoded
})

// proses hapus kontak
app.get("/contact/delete/:nama",(request, response)=>{
    const contact = cariKontak(request.params.nama);
    if(!contact){
        response.status(404);
    }else{
        hapusKontak(request.params.nama)
        request.flash("pesan","Data kontak berhasil dihapus.");
        response.redirect("/contact"); // menuju app.get("/contact")
    }
})

// form ubah data kontak
app.get("/contact/edit/:nama", (request, response)=>{
    const contact = cariKontak(request.params.nama);
    response.render("edit-contact",{
        judul: "Form Ubah Data Kontak",
        layout: "layouts/main-layout",
        contact : contact
    })
});

// proses ubah data
app.post("/contact/update", 
[
    // validasi isian data form dari user
    body("nama").custom((inputNama, {req})=>{ // req ini nama dari request yang sudah diatur oleh express validator (tidak bisa diubah2)
    const dataDuplikat = cekDuplikat(inputNama);
    if(inputNama !== req.body["namaLama"] && dataDuplikat){
        throw new Error("Nama kontak sudah digunakan!");
    }
    return true;
    }),
    check("email","Email tidak valid").isEmail(),
    check("nomor", "Nomor handphone tidak valid").isMobilePhone("id-ID")
],(request, response)=>{
    // validasi data form
    const errors = validationResult(request);
    // jika ada error
    if(!errors.isEmpty()){
        // return response.status(400).json({errors: errors.array()});
        response.render("edit-contact",{
            judul: "Form Ubah Data Kontak",
            layout: "layouts/main-layout",
            errors: errors.array(),
            contact: request.body // data terkirim lewat form ada di body
        })
    }
    // jika tidak ada error
    else{
        updateKontak(request.body); // dalam bentuk object
        // kirim pesan kilat
        request.flash("pesan","Data kontak berhasil diubah.");
        response.redirect("/contact"); // menuju app.get("/contact")
    }
    // data yang dikirim dari form harus diparsing dulu menggunakan express.urlencoded
})




// halaman detail kontak
// routing ketika user mengeklik detail dari nama kontak yang ada di daftar
app.get("/contact/:nama",(request,response)=>{
    // cari kontak dengan menggunakan fungsi cariKontak dengan argumen data parameter nama 
    const dataTunggalKontak = cariKontak(request.params.nama);
    response.render("detail",{
        judul: "Halaman Detail Contact",
        layout: "layouts/main-layout",
        // data contacts akan dikirim ke file contact.ejs
        contact : dataTunggalKontak
    })
})

// menjalankan middleware
app.use('/',(request,response)=>{
    response.status(404);
    response.send("Capek banggg"); // bisa jalan untuk request apapun
})

app.listen(port,()=>{
    console.log(`Web server berjalan di port ${port}`)
})

