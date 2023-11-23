const express = require("express");
const client = require('../../database/connect'); // konektor k DB

const getData = express.Router();

getData.get('/getdata', async (req, res) => {
    try {

        // výpis všech tabulek
        const queryCharacter = 'SELECT * FROM character';
        const resultCharacter = await client.query(queryCharacter);
        console.log('Načtené postavy:', resultCharacter.rows);
  
        const queryNemesis = 'SELECT * FROM nemesis';
        const resultNemesis = await client.query(queryNemesis);
        console.log('Načtené tresty:', resultNemesis.rows);
  
        const querySecret = 'SELECT * FROM secret';
        const resultSecret = await client.query(querySecret);
        console.log('Načtené kódy:', resultSecret.rows);

        // fce na výpočet věku postav
        const calculateAge = (birthDate) => {
            const today = new Date();
            const born = new Date(birthDate);
            let age = today.getFullYear() - born.getFullYear();
            
            const monthDiff = today.getMonth() - born.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            } // kontrola letošních narozenin
        
            return age;
        };
        
        // vytvoření pole postav s jejich věkem
        const charactersWithAge = resultCharacter.rows.map((character) => {
            return {
                name: character.name,
                age: calculateAge(character.born)
            };
        });

        console.log(charactersWithAge)

        // vytvoření pole trestů s jejich věkem
        const nemesisWithAge = resultNemesis.rows.map((nemesis) => {
            return {
                age: nemesis.years
            };
        });

        console.log(nemesisWithAge)

        // výpočet průměrného věku postav
        const totalCharacterAge = charactersWithAge.reduce((acc, character) => acc + character.age, 0);
        const averageCharacterAge = totalCharacterAge / charactersWithAge.length;

        // výpočet průměrného věku nepřátel
        const totalNemesisAge = nemesisWithAge.reduce((acc, nemesis) => acc + nemesis.age, 0);
        const averageNemesisAge = totalNemesisAge / nemesisWithAge.length;

        // výpočet průměrného věku
        const avgAge = Math.round((averageCharacterAge + averageNemesisAge) / 2);

        // do konzole
        console.log("Průměrný věk postav: " + averageCharacterAge);
        console.log("Průměrný věk trestů: " + averageNemesisAge);
        console.log("Průměr celkem: " + avgAge);

        // vytvoření pole postav s jejich váhou
        const charactersWithWeight = resultCharacter.rows.map((character) => {
            const weight = parseFloat(character.weight);
            if (!isNaN(weight)) {
                return { weight };
            } else {
                return null; // pokud je váha null nebo neplatná, vrátí null
            }
        }).filter((character) => character !== null); // vyfiltruje null hodnoty
        
        console.log(charactersWithWeight);

        // výpočet průměrné váhy postav
        const totalCharacterWeight = charactersWithWeight.reduce((acc, character) => acc + character.weight, 0);
        const averageCharacterWeight = totalCharacterWeight / charactersWithWeight.length;

        console.log("Průměrná váha postav: " + averageCharacterWeight);

        let femaleCount = 0;
        let maleCount = 0;
        let otherCount = 0;
        
        // výpočet pohlaví (female/male/other)
        resultCharacter.rows.forEach((character) => {
            if (character.gender !== null && typeof character.gender === 'string') {
                const genderLowerCase = character.gender.toLowerCase(); // převést vše na malá písmena
        
                if (genderLowerCase === 'female' || genderLowerCase === 'f') {
                    femaleCount++;
                } else if (genderLowerCase === 'male' || genderLowerCase === 'm') {
                    maleCount++;
                } else {
                    otherCount++;
                }
            } else {
                otherCount++;
            }
        });

        // vytvoř seznam s pohlavím
        const gendersMap = {
            female: femaleCount,
            male: maleCount,
            other: otherCount
        };

        // dotazy na tabulky
        const query = `
        SELECT json_agg(
            json_build_object(
                'data', character.*,
                'has_nemesis', (
                    SELECT json_agg(
                        json_build_object(
                            'data', nemesis.*,
                            'has_secret', (
                                SELECT json_agg(
                                    json_build_object(
                                        'data', secret.*
                                    )
                                )
                                FROM secret
                                WHERE secret.nemesis_id = nemesis.id
                            )
                        )
                    ) AS nemesis
                    FROM nemesis
                    WHERE character.id = nemesis.character_id
                )
            )
        ) AS characters
        FROM character;
        `;

        // získání výsledků
        const result = await client.query(query);

        let combinedData = {
            characters_count: charactersWithAge.length,
            average_age: avgAge,
            average_weight: Math.round(averageCharacterWeight),
            genders: gendersMap,
            rows: result.rows
        };

        // odpověď ve formátu JSON
        res.json(combinedData);

    } catch (err) {
        console.error('Chyba při získávání dat z DB:', err);
        // error log
        res.status(500).json({ error: 'Chyba při získávání dat' });
    }
});

module.exports = getData
