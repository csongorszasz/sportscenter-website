-- projekt setup



-- ##################################
-- # Adatbazis letrehozasa
-- ##################################

DROP DATABASE IF EXISTS projekt;
CREATE DATABASE IF NOT EXISTS projekt;
USE projekt;


-- ##################################
-- # Tablak letrehozasa
-- ##################################

CREATE TABLE IF NOT EXISTS Felhasznalok (
    ID INT AUTO_INCREMENT,
    Felhasznalonev VARCHAR(50) UNIQUE,
    Jelszo VARCHAR(100),
    Szerep VARCHAR(20) DEFAULT 'student',
    Fiokallapot VARCHAR(10), -- pending | approved | banned
    PRIMARY KEY(ID)
);

CREATE TABLE IF NOT EXISTS Sportpalyak (
    ID INT AUTO_INCREMENT,
    Tipus VARCHAR(20),
    Oraber FLOAT,
    Cim VARCHAR(50),
    Leiras VARCHAR(100),
    Nyitas TIME,
    Zaras TIME,
    PRIMARY KEY(ID)
);

CREATE TABLE IF NOT EXISTS Kepek (
    KepID INT AUTO_INCREMENT,
    PalyaID INT,
    Nev VARCHAR(300), 
    PRIMARY KEY(KepID),
    FOREIGN KEY (PalyaID) REFERENCES Sportpalyak(ID)
);

CREATE TABLE IF NOT EXISTS Foglalasok (
    FoglalasID INT AUTO_INCREMENT,
    Felhasznalonev VARCHAR(50),
    PalyaID INT,
    Idopont DATETIME,
    Idotartam INT,
    PRIMARY KEY(FoglalasID),
    FOREIGN KEY (Felhasznalonev) REFERENCES Felhasznalok(Felhasznalonev),
    FOREIGN KEY (PalyaID) REFERENCES Sportpalyak(ID)
);


-- ##################################
-- # Adatok beszurasa
-- ##################################

INSERT INTO Felhasznalok (Felhasznalonev, Jelszo, Szerep, Fiokallapot) VALUES ('ferike', '$2b$10$GW92MIz1WdWneHCbnhkTJOjGTwXs//AsmKKNYUhwsyvRhgBfms0ve', 'student', 'approved'), -- jelszo: x
                                                                            ('jimmy', '$2b$14$wz7IRRWkmOPeQoDu0/5N7OSYStBvkXeuPdgZMC8vsMKj4KK03zQWW', 'student', 'approved'), -- jelszo: x
                                                                            ('isten', '$2b$13$PUJp26cauQenbs9yCX1OKeMKTj8B49jFPFQjXuOsKBJr9tl9gNENm', 'admin', 'approved'); -- jelszo: xx
                                                                            ('rosszdiak', '$2b$13$PUJp26cauQenbs9yCX1OKeMKTj8B49jFPFQjXuOsKBJr9tl9gNENm', 'student', 'banned'); -- jelszo: xx

INSERT INTO Sportpalyak (Tipus, Oraber, Cim, Leiras, Nyitas, Zaras) VALUES ('kosarlabda', 30, 'Str. Pastorului 2', 'Kituno kosarpalya', '05:00:00', '22:00:00'),
                                                                           ('tenisz', 80, 'Str. Mare 9', 'Profi', '07:00:00', '20:00:00'),
                                                                           ('foci', 150, 'Str. Mica', 'Remek palya', '17:30:00', '23:30:00');

INSERT INTO Kepek (PalyaID, Nev) VALUES (1, 'b293c0681440ab45b1c354aecd404711'),
                                        (2, '3895642519e9472c7bce1a247f2ba649'),
                                        (2, 'a670a12ab5bfd869b606a1d2ce0a1d91');

INSERT INTO Foglalasok (Felhasznalonev, PalyaID, Idopont, Idotartam) VALUES ('ferike', 1, '2024-06-29 19:00:00', 2),
                                                                        ('jimmy', 2, '2024-06-22 08:00:00', 1),
                                                                        ('ferike', 1, '2024-06-30 07:00:00', 3),
                                                                        ('jimmy', 1, '2024-07-06 21:00:00', 1),
                                                                        ('jimmy', 2, '2024-06-22 16:00:00', 2),
                                                                        ('ferike', 1, '2024-06-29 19:00:00', 2);

