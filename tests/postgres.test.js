import { beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { Client } from 'pg';
import config from '../config';

describe(config.host, () => {
  test('can connect to postgres', async () => {
    const client = new Client({ ...config, ssl: true });
    await client.connect();
    await client.end();
  });

  test('can query postgres', async () => {
    const client = new Client({ ...config, ssl: true });
    await client.connect();
    const res = await client.query('SELECT NOW()');
    await client.end();
    expect(res.rows[0].now).toBeDefined();
  });

  beforeAll(async () => {
    const client = new Client({ ...config, ssl: true });
    await client.connect();
    await client.query(
      [
        'DROP SCHEMA IF EXISTS bohemia CASCADE',
        'DROP SEQUENCE IF EXISTS address_seq',
        'DROP SEQUENCE IF EXISTS employee_seq',
        'DROP SEQUENCE IF EXISTS project_seq',
        'DROP SEQUENCE IF EXISTS studio_seq',
        'DROP SEQUENCE IF EXISTS contract_seq',
        'DROP SEQUENCE IF EXISTS assignment_seq'
      ].join(';')
    );
    await client.end();
  });

  describe('CREATE', async () => {
    const client = new Client({ ...config, ssl: true });
    await client.connect();

    test('SCHEMA bohemia', async () => {
      const res = await client.query('CREATE SCHEMA bohemia;');
      expect(res.command).toBe('CREATE');
      expect(res.rowCount).toBe(null);
    });

    test('SEQUENCE THEN TABLE bohemia.address', async () => {
      const seq = await client.query('CREATE SEQUENCE address_seq start 1 increment 1');

      expect(seq.command).toBe('CREATE');
      expect(seq.rowCount).toBe(null);

      const res = await client.query(
        `CREATE TABLE bohemia.address (${[
          '"addressId" bigserial not null primary key',
          '"addressLine" varchar(255) not null',
          '"postCode" varchar(255) not null'
        ].join(',')});`
      );

      expect(res.command).toBe('CREATE');
      expect(res.rowCount).toBe(null);
    });

    test('SEQUENCE THEN TABLE bohemia.project', async () => {
      const seq = await client.query('CREATE SEQUENCE project_seq start 1 increment 1');

      expect(seq.command).toBe('CREATE');
      expect(seq.rowCount).toBe(null);

      const res = await client.query(
        `CREATE TABLE bohemia.project (${[
          '"projectId" bigserial not null primary key',
          '"projectName" varchar(255) not null',
          'description varchar(1024) not null',
          'platform varchar(100) not null',
          'genre varchar(100) null'
        ].join(',')});`
      );

      expect(res.command).toBe('CREATE');
      expect(res.rowCount).toBe(null);
    });

    test('SEQUENCE THEN TABLE bohemia.studio', async () => {
      const seq = await client.query('CREATE SEQUENCE studio_seq start 1 increment 1');

      expect(seq.command).toBe('CREATE');
      expect(seq.rowCount).toBe(null);

      const res = await client.query(
        `CREATE TABLE bohemia.studio (${[
          '"studioId" bigserial not null primary key',
          '"studioName" varchar(255) not null',
          'description varchar(1000) not null',
          '"studioHead" varchar(255) not null',
          'phone bigint not null',
          '"alternativePhone" bigint null',
          "email varchar(255) not null constraint studio_email_is_email check (email like '%_@_%')",
          '"addressFK" bigint not null constraint studio_address_addressId_fk references bohemia.address',
          'platform varchar(255) not null'
        ].join(',')});`
      );

      expect(res.command).toBe('CREATE');
      expect(res.rowCount).toBe(null);
    });

    test('SEQUENCE THEN TABLE bohemia.projectAssignment', async () => {
      const seq = await client.query('CREATE SEQUENCE assignment_seq start 1 increment 1');

      expect(seq.command).toBe('CREATE');
      expect(seq.rowCount).toBe(null);

      const res = await client.query(
        `CREATE TABLE bohemia."projectAssignment" (${[
          '"assignmentId" bigserial not null primary key',
          '"projectFK" bigint not null constraint "projectAssignment_project_projectId_fk" references bohemia.project',
          '"studioFK" bigint not null constraint "projectAssignment_studio_studioId_fk" references bohemia.studio',
          'status varchar(50) not null'
        ].join(',')});`
      );

      expect(res.command).toBe('CREATE');
      expect(res.rowCount).toBe(null);
    });

    test('SEQUENCE THEN TABLE bohemia.employee', async () => {
      const seq = await client.query('CREATE SEQUENCE employee_seq start 1 increment 1');

      expect(seq.command).toBe('CREATE');
      expect(seq.rowCount).toBe(null);

      const res = await client.query(
        `CREATE TABLE bohemia.employee (${[
          '"employeeId" bigserial not null primary key',
          '"firstName" varchar(255) not null',
          '"lastName" varchar(255) not null',
          'email varchar(255) not null constraint "employee_email_is_email" check (email like \'%_@_%\')',
          'username varchar(255) not null unique',
          'phone bigint not null',
          '"addressFK" bigint not null constraint "employee_address_addressId_fk" references bohemia.address',
          '"currentProjectFK" bigint null constraint "employee_project_projectId_fk" references bohemia.project',
          '"pastProjects" varchar(1024) null'
        ].join(',')});`
      );

      expect(res.command).toBe('CREATE');
      expect(res.rowCount).toBe(null);
    });

    test('SEQUENCE THEN TABLE bohemia.employeeContract', async () => {
      const seq = await client.query('CREATE SEQUENCE contract_seq start 1 increment 1');

      expect(seq.command).toBe('CREATE');
      expect(seq.rowCount).toBe(null);

      const res = await client.query(
        `CREATE TABLE bohemia."employeeContract" (${[
          '"contractId" bigserial not null primary key',
          '"employeeFK" bigint not null constraint "employeeContract_employee_employeeId_fk" references bohemia.employee',
          '"studioFK" bigint null constraint "employeeContract_studio_studioId_fk" references bohemia.studio',
          '"startDate" date default current_date not null',
          '"endDate" date null',
          'status varchar(50) not null',
          '"currentRole" varchar(50) null'
        ].join(',')});`
      );

      expect(res.command).toBe('CREATE');
      expect(res.rowCount).toBe(null);
    });
  });

  describe('INSERT', async () => {
    const client = new Client({ ...config, ssl: true });
    await client.connect();

    test('INTO bohemia.project', async () => {
      await client.query(
        [
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Exploring Numbers with Shaun', 'Learn how to add, subtract and multiply with the help of a famous sheep.', 'Mobile', 'Edutainment')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Learning Letters with Leo', 'Leo the lion helps your child with their phonics and pronunciations.', 'Mobile', 'Edutainment')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Mathematics with Matilda', 'Use fun games with Matilda and learn multiplication and long division.', 'Mobile', 'Edutainment')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Drawing the Desert', 'Learn about the desert and how to draw one accurately.', 'Mobile', 'Edutainment')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('All About Huskies with Loki', 'Huskies are the best dogs and Loki teaches you how to care for them in this game.', 'Mobile', 'Edutainment')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Sailing the Seven Seas', 'Sail the ocenas and seas with the whalers on the moon!', 'Mobile', 'Edutainment')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Meeting Meerkats', 'Meerkats make learning how to make numerical comparisons fun.', 'Mobile', 'Edutainment')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('All About Cats with Rocket and Pepper', 'Includes 100 spot the difference challenges with cats Rocket and Pepper.', 'Mobile', 'Edutainment')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Mood', 'The original 1993 classic re-released for modern PCs.', 'PC', 'First Person Shooter')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Mood 2', 'Followup to the 1993 seminal classic, Mood.', 'PC', 'First Person Shooter')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Final Mood', 'A selection of fan-made levels released to celebrate the modding community.', 'PC', 'First Person Shooter')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Mood Etheral', 'An arcade FPS extraveganza re-envisioning of the original Mood for todays graphical hardware.', 'PC', 'First Person Shooter')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Ragged', 'Experience an open-world post-apocalyptic world as a survivor of the apocalypse.', 'PC', 'First Person Shooter')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Ragged 2', 'Continues the story of our hero, fighting over the last remains of the global oil supply.', 'PC', 'First Person Shooter')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Tsunami', 'Gothic architecture combines with sci-fi robotic stereotypes. Follow-up 3D masterpiece to Mood.', 'PC', 'First Person Shooter')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Tsunami Conflict', 'Asymmetric team based action set in the world of Tsumani.', 'PC', 'First Person Shooter')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Starting Reality IV', 'The 2nd MMORPG created by Circle, translated and release for the UK audience.', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Stereotype 5', 'Latest game in the reality merging school-scenario demon hunting hit series.', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Feng Shui Simulator', 'A unique take on gardening simuators with a JRPG twist.', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Feng Shui Simulator: Shedded', 'An expansion pack that enables you to build your very own shed!', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Feng Shui Simulator: Yasai', 'An expansion that provides 50 new vegitables to grow in your very own digital garden.', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Feng Shui Simulator: Garden Pests', 'An expansion pack that adds new game mechanics to protect your garden from birds, bunnies and blight.', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Origami Battler', 'Collect and raise your own creature, made from folded paper, and battle them with other folded paper monsters.', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Heap Destruction', 'Starting off with nothing, you use your tools to create??? something. Then detroy it and start again! In 3D.', 'PC', 'Sandbox')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Speed of Sound', 'Build your own spaceship and travel the stars, finding new parts and enhancements.', 'PC', 'Sandbox')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Earthendion', 'Starting off with nothing, you use your tools to create??? something. Then detroy it and start again! In 2D.', 'PC', 'Sandbox')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Simon''s Sandbox', 'Originally a mod based on Valve''s Source Engine, Simon''s Sandbox is now a fully standalone sandbox game.', 'PC', 'Sandbox')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Ninja''s Resolution', 'Jump into the past and experienced an alternative history through the eyes of your ninja ancestors.', 'Console', '3rd Person Action Adventure')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Light Hearts', 'Battle through gothic environments, using tatics and strategies to defeat reanimated monsters.', 'Console', '3rd Person Action Adventure')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Quest', 'Travel through a desert landscape, solving puzzles as you progress.', 'Console', '3rd Person Action Adventure')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Marin: Peony of Light', 'Explore the land of Kyrule and defeat the evil Danon!', 'Console', '3rd Person Action Adventure')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Newborn Chalice', 'A brand new game Souls-like game. Story by the award winning author, R. G. G. Tinmann', 'Console', '3rd Person Action Adventure')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Quadroe', 'Abandoned child makes friends with a cat-like beast and escapes their captives.', 'Console', '3rd Person Action Adventure')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('War''s Star: Farmers Strike Back', 'Not too far in the future, not so far from here, farmers rise up against their oppressors!', 'Console', '3rd Person Action Adventure')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Kangaroo Simulator', 'Run around in this sandbox game as a kangaroo, scoring points while causing mayhem.', 'PC', null)`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Recognised Player''s Wargrounds (RPWG)', 'A game that shot to fame by turning the concepts from the Japanese film ''Battle Royale'' into a teambased FPS.', 'PC', null)`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Lost in the Limbo of the Found', 'Find yourself lost in limbo, where different games come together to create a singular, copyright-infringing experience.', 'PC', null)`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Hunt down the Leemar', 'A modification based on the radioactive first-person shooter, Full-Life', 'PC', null)`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Queen of Combatants XV', 'A 2D side-scrolling beat-em-up using the Beats of Rage engine.', 'PC', null)`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Running Osterich', 'Simple 2D auto-scrolling game that relies on a single button make the osterich jump and try to fly.', 'PC', null)`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Super Norman Cousins', 'A 2D side-scrolling platform game where mechanics jump on rodents and save their princess.', 'PC', null)`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Workers on Strike', 'Two opposing teams of office workers battle it out on spreadsheets to see who comes out as the winner!', 'PC', null)`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Pizzeria-mole''', 'Series of food-based minigames that can be played with upto 8 players.', 'PC', null)`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('House of the Ned', 'Arcade-style lightgun game set within a mansion filled with monsters based on a certain Mr. Flanders.', 'PC', null)`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Pillowings', 'Arcade-style lightgun game set within a mansion filled with monsters based on a certain Mr. Flanders.', 'PC', null)`
        ].join(';')
      );

      const res = await client.query('SELECT * FROM bohemia.project');

      expect(res.command).toBe('SELECT');
      expect(res.rowCount).toBe(45);

      res.rows.forEach((row) => {
        expect(row).toHaveProperty('projectName');
        expect(row).toHaveProperty('description');
        expect(row).toHaveProperty('platform');
        expect(row).toHaveProperty('genre');
      });
    });

    test('INTO bohemia.address', async () => {
      await client.query(
        [
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('12 Main Street, Canterbury', 'CT1 1AA')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('2 Central Avenue, London', 'W1 1CJ')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('192 Bridge Road, London', 'SE2 2PQ')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('19 The Lanes, Portsmouth', 'PO1 1BA')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('55 Barnham Road, Gilford', 'BT63 6QU')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('Ela Mill, Cort St, Bury', 'BL9 7BW')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('31 Grange Road, Canterbury', 'CT9 2ND')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('31 Park Lane, Canterbury', 'CT13 0NF')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('80 North Street, Canterbury', 'CT14 9DL')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('29 Mill Lane, Canterbury', 'CT13 0NU')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('44 Richmond Road, Canterbury', 'CT6 5HH')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('30 Queens Road, Canterbury', 'CT11 9JW')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('50 Alexander Road, Canterbury', 'CT1 7RN')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('37 Station Road, Canterbury', 'CT1 5LD')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('30 Church Lane, Canterbury', 'CT1 6AL')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('30 The Avenue, Canterbury', 'CT2 8HH')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('62 Stanley Road, Canterbury', 'CT5 1LH')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('15 High Street, Canterbury', 'CT1 0PT')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('43 Manchester Road, Canterbury', 'CT2 8HF')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('41 Main Street, Canterbury', 'CT5 1FT')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('3 Chester Road, Canterbury', 'CT5 2BA')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('64 Park Avenue, Canterbury', 'CT6 8TJ')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('80 Park Road, Canterbury', 'CT2 6BJ')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('2 New Street, Canterbury', 'CT1 6DR')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('8 Kingsway, Canterbury', 'CT1 9SD')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('57 Highfield Road, Canterbury', 'CT1 9XR')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('52 The Crescent, Canterbury', 'CT9 9TA')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('55 George Street, Canterbury', 'CT2 1EH')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('2 Station Road, Canterbury', 'CT3 2HS')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('80 Mill Road, Canterbury', 'CT1 0RW')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('39 School Lane, Canterbury', 'CT1 0EN')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('43 Windsor Road, Canterbury', 'CT8 8HT')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('20 Church Lane, Canterbury', 'CT1 7EA')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('29 West Street, Canterbury', 'CT1 6DF')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('2 Sweetlove Place, Wingham', 'CT3 1BJ')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('1 Old Tree, Hoath', 'CT3 4LH')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('131 Bridge Street, Wye, Ashford', 'TN25 5DP')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('4 Beatrice Hills Close, Kennington, Ashford', 'TN24 9PQ')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('17 Frank Edinger Close, Kennington', 'TN24 9RB')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('10 Intelligence Walk, Ashford', 'TN23 3FE')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('8 Blossom Lane, Ashford', 'TN25 4GE')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('1 Thornlea, Ashford', 'TN23 3JX')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('52 Springwood Drive, Ashford', 'TN25 4GE')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('67 Church Road, Canterbury', 'CT1 9AP')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('24 Springfield Road, Canterbury', 'CT1 9DU')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('51 Manor Road, Canterbury', 'CT2 4LF')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('66 School Lane, Canterbury', 'CT1 9TH')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('16 South Street, Canterbury', 'CT1 1NU')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('52 London Road, Canterbury', 'CT1 1TZ')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('21 The Green, Canterbury', 'CT1 1GF')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('105 High Street, Wingham', 'CT3 1DE')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('78 The Crescent, Canterbury', 'CT1 7JE')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('8 York Road, Canterbury', 'CT2 6DP')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('44 St. John''s Road, Canterbury', 'CT3 1TL')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('17 Kingsway, Canterbury', 'CT2 7QR')`,
          `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('25 West Street, Canterbury', 'CT1 6JR')`
        ].join(';')
      );

      const res = await client.query('SELECT * FROM bohemia.address');

      expect(res.command).toBe('SELECT');
      expect(res.rowCount).toBe(56);

      res.rows.forEach((row) => {
        expect(row).toHaveProperty('addressId');
        expect(row).toHaveProperty('addressLine');
        expect(row).toHaveProperty('postCode');
      });
    });

    test('INTO bohemia.studio', async () => {
      await client.query(
        [
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternativePhone", email) VALUES ('Fuzzy Sheep Studios', 'Specialises in porting games from Bohemia Group studios to Android and iOS platforms including smartphones and tablets.', 'Mobile', 'William Butcher', 1, 1227555666, 07700900445, 'will.butcher@fuzzysheep.com')`,
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternativePhone", email) VALUES ('Ego Applications', 'A software studio that became famous for Mood, the grandfather of First Person Shooter games, released in the 1990s.', 'PC', 'Annie January', 2, 8006133589, 07700900678, 'annie.january@egoapps.co.uk' )`,
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternativePhone", email) VALUES ('Dattebayo!', 'A UK based developer who focuses on translating and releasing Japanese anime-based videogames for the western audience.' , 'Console', 'Ashleigh Cohen', 3, 1614960267, 07700900321, 'ashleigh.cohan@dattebayo.com')`,
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternativePhone", email) VALUES ('DojoKun', 'Known for their creative sandbox games that use voxels instead of polygons with randomly generated environments.', 'PC', 'Reggie Franklin', 4, 2011151612, 07700900175, 'reggie.franklin@dojokun.net')`,
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternativePhone", email) VALUES ('Big Zebra Solutions', 'Recently secured funding from Sony to create a AAA 3rd person adventure game. Their previous titles were minimalist art-as-games experiences.', 'Console', 'Maggie Shaw', 5, 1483960457, 07700900667, 'maggie.shaw@bigzebrasolutions.com')`,
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternativePhone", email) VALUES ('Unhinged', 'A small team who create games using assets from 3D model repositories. Unhinged concentrate mainly on games that make use of their in-house Eagle Engine.', 'PC', 'Yasmin Singh', 6, 1614960928, 07700900299, 'yasmin.singh@unhinged.co.uk')`
        ].join(';')
      );

      const res = await client.query('SELECT * FROM bohemia.studio');

      expect(res.command).toBe('SELECT');
      expect(res.rowCount).toBe(6);

      res.rows.forEach((row) => {
        expect(row).toHaveProperty('studioName');
        expect(row).toHaveProperty('description');
        expect(row).toHaveProperty('studioHead');
        expect(row).toHaveProperty('addressFK');
        expect(row).toHaveProperty('phone');
        expect(row).toHaveProperty('alternativePhone');
        expect(row).toHaveProperty('email');
      });
    });

    test('INTO bohemia.employee', async () => {
      await client.query(
        [
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Jessi', 'Winstone', 'JessiWinstone@fuzzsheep.com', 'jwinstone0', '07700900171', 7, 1, 'Learning Letters with Leo, Mathematics with Matilda, Meeting Meerkats')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Gottfried', 'Dallon', 'GottfriedDallon@fuzzysheep.com', 'gdallon1', '07700900543', 8, 1, 'Learning Letters with Leo, Mathematics with Matilda, All About Huskies with Loki')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Sally', 'Gentzsch', 'SallyGentzsch@fuzzysheep.com', 'sgentzsch2', '07700900516', 9, 8, 'Learning Letters with Leo, Drawing the Desert, All About Huskies with Loki, Meeting Meerkats')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Lucio', 'Spiaggia', 'LucioSpiaggia@fuzzysheep.com', 'lspiaggia3', '07700900243', 10, 8, 'Learning Letters with Leo, Drawing the Desert, Meeting Meerkats')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Lombard', 'Challener', 'LombardChallener@fuzzysheep.com', 'lchallener4', '07700900449', 11, null, 'Drawing the Desert, All About Huskies with Loki')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Ardyce', 'Hesey', 'ArdyceHesey@egoapps.co.uk', 'ahesey5', '07700900017', 12, 14, 'Mood, Mood 2, Final Mood')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Catha', 'Engall', 'CathaEngall@egoapps.co.uk', 'cengall6', '07700900418', 13, 14, 'Mood, Mood 2, Final Mood')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Flori', 'O'' Molan', 'FloriO''Molan@egoapps.co.uk', 'fomolan7', '01632960854', 14, 14, 'Mood, Mood 2, Final Mood')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Freddie', 'Huetson', 'FreddieHuetson@egoapps.co.uk', 'fhuetson8', '07700900263', 15, 14, 'Mood, Mood 2, Final Mood')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Dermot', 'Truss', 'DermotTruss@egoapps.co.uk', 'dtruss9', '07700900125', 16, 14, 'Mood, Mood 2, Final Mood')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Francoise', 'Rishbrook', 'FrancoiseRishbrook@egoapps.co.uk', 'frishbrooka', '07700900787', 17, 14, 'Final Mood, Ragged, Tsunami')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Giuditta', 'Cubbin', 'GiudittaCubbin@egoapps.co.uk', 'gcubbinb', '01632960731', 18, 14, 'Tsunami, Tsunami Conflict')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Rodie', 'Lukins', 'RodieLukins@egoapps.co.uk', 'rlukinsc', '07700900879', 19, 14, null)`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Harman', 'Berriball', 'HarmanBerriball@egoapps.co.uk', 'hberriballd', '07700900879', 20, 14, null)`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Halsy', 'Cubbino', 'HalsyCubbino@egoapps.co.uk', 'hcubbinoe', '07700900571', 21, 14, 'Tsunami, Tsunami Conflict')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Lazaro', 'Bougourd', 'LazaroBougourd@egoapps.co.uk', 'lbougourdf', '07700900008', 22, 14, 'Tsunami, Tsunami Conflict')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Tulley', 'Fearn', 'TulleyFearn@egoapps.co.uk', 'tfearng', '07700900034', 23, null, 'Mood, Final Mood, Ragged, Tsunami Conflict')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Stanfield', 'Gethen', 'StanfieldGethen@egoapps.co.uk', 'sgethenh', '07700900312', 24, null, 'Mood, Final Mood, Ragged, Tsunami Conflict')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Betta', 'Storre', 'BettaStorre@egoapps.co.uk', 'bstorrei', '07700900446', 25, null, 'Mood, Final Mood, Ragged, Tsunami Conflict')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Adrian', 'Cockson', 'AdrianCockson@dattebayo.com', 'acocksonj', '07700900922', 26, 17, null)`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Trixi', 'Ioselev', 'TrixiIoselev@dattebayo.com', 'tioselevk', '07700900416', 27, 17, null)`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Hesther', 'Wimpey', 'HestherWimpey@dattebayo.com', 'hwimpeyl', '01632960694', 28, 17, 'Feng Shui Simulator')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Dannel', 'Hollington', 'DannelHollington@dattebayo.com', 'dhollingtonm', '07700900519', 29, 17, 'Feng Shui Simulator, Feng Shui Simulator: Yasai')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Brendon', 'Adamsson', 'BrendonAdamsson@dattebayo.com', 'badamssonn', '07700900702', 30, null, 'Feng Shui Simulator, Feng Shui Simulator: Shedded')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Evanne', 'Scholig', 'EvanneScholig@dattebayo.com', 'escholigo', '01632960826', 31, 18, null)`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Byrom', 'Tassell', 'ByromTassell@dattebayo.com', 'btassellp', '07700900050', 32, 18, null)`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Felike', 'Malt', 'FelikeMalt@dattebayo.com', 'fmaltq', '07700900203', 33, 18, 'Feng Shui Simulator')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Jenny', 'Major', 'JennyMajor@dattebayo.com', 'jmajorr', '07700900347', 34, 18, 'Feng Shui Simulator, Feng Shui Simulator: Yasai')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Zebedee', 'Seyler', 'ZebedeeSeyler@dattebayo.com', 'zseylers', '07700900172', 35, 22, 'Feng Shui Simulator, Feng Shui Simulator: Shedded')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Jacinthe', 'Oxshott', 'JacintheOxshott@dattebayo.com', 'joxshottt', '07700900827', 36, 22, 'Feng Shui Simulator, Feng Shui Simulator: Shedded')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Sheryl', 'Neve', 'SherylNeve@dattebayo.com', 'sneveu', '07700900952', 37, 23, 'Feng Shui Simulator, Feng Shui Simulator: Yasai')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Corrie', 'Michin', 'CorrieMichin@dattebayo.com', 'cmichinv', '07700900283', 38, 23, null)`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Elbert', 'Tyhurst', 'ElbertTyhurst@dattebayo.com', 'etyhurstw', '07700900692', 39, 23, null)`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Susannah', 'Mallindine', 'SusannahMallindine@dattebayo.com', 'smallindinex', '07700900013', 40, null, 'Feng Shui Simulator, Feng Shui Simulator: Shedded, Feng Shui Simulator: Yasai')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Tabbi', 'Malinowski', 'TabbiMalinowski@dojokun.net', 'tmalinowskiy', '07700900923', 41, 27, 'Speed of Sound, Earthendion')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Phelia', 'Faustin', 'PheliaFaustin@dojokun.net', 'pfaustinz', '07700900817', 42, 27, null)`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Raul', 'Hillock', 'RaulHillock@dojokun.net', 'rhillock10', '01632960616', 43, 27, 'Earthendion')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Nannie', 'Loader', 'NannieLoader@dojokun.net', 'nloader11', '07700900910', 44, 27, 'Heap Destruction')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Cornelle', 'Pouton', 'CornellePouton@dojokun.net', 'cpouton12', '07700900580', 45, null, 'Heap Destruction, Speed of Sound, Earthendion')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Ikey', 'Bowry', 'IkeyBowry@bigzebrasolutions.com', 'ibowry13', '07700900604', 46, 28, 'Light Hearts, Quest, War''s Star: Farmers Strike Back')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Brook', 'Dunan', 'BrookDunan@bigzebrasolutions.com', 'bdunan14', '01632960546', 47, 31, 'Light Hearts, Quest, War''s Star: Farmers Strike Back')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Yalonda', 'Haswall', 'YalondaHaswall@bigzebrasolutions.com', 'yhaswall15', '07700900544', 48, 32, null)`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Celina', 'Dulton', 'CelinaDulton@bigzebrasolutions.com', 'cdulton16', '07700900341', 49, null, 'Quest, War''s Star: Farmers Strike Back')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Valencia', 'Hadrill', 'ValenciaHadrill@bigzebrasolutions.com', 'vhadrill17', '07700900408', 50, 31, 'Quest')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Ashla', 'Godding', 'AshlaGodding@unhinged.co.uk', 'agodding18', '07700900217', 51, 41, 'Kangaroo Simulator, Recognised Player''s Wargrounds (RPWG), Queen of Combatants XV')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Rikki', 'Tidmarsh', 'RikkiTidmarsh@unhinged.co.uk', 'rtidmarsh19', '07700900113', 52, 42, 'Hunt down the Leemar, Pillowings')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Bobbie', 'Edlyn', 'BobbieEdlyn@unhinged.co.uk', 'bedlyn1a', '07700900351', 53, 43, 'Running Osterich, Pillowings')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Luci', 'Cometson', 'LuciCometson@unhinged.co.uk', 'lcometson1b', '01632960779', 54, 44, null)`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Elana', 'Flipek', 'ElanaFlipek@unhinged.co.uk', 'eflipek1c', '07700900170', 55, 41, 'Hunt down the Leemar, Running Osterich')`,
          `INSERT INTO bohemia.employee ("firstName", "lastName", email, username, phone, "addressFK", "currentProjectFK", "pastProjects") VALUES ('Leola', 'Spall', 'LeolaSpall@unhinged.co.uk', 'lspall6v', '07700900693', 56, 42, null)`
        ].join(';')
      );

      const res = await client.query(`SELECT * FROM bohemia.employee`);
      expect(res.rows).toHaveLength(50);

      res.rows.forEach((row) => {
        expect(row).toHaveProperty('employeeId');
        expect(row).toHaveProperty('firstName');
        expect(row).toHaveProperty('lastName');
        expect(row).toHaveProperty('email');
        expect(row).toHaveProperty('username');
        expect(row).toHaveProperty('phone');
        expect(row).toHaveProperty('addressFK');
        expect(row).toHaveProperty('currentProjectFK');
        expect(row).toHaveProperty('pastProjects');
      });
    });

    test('INTO bohemia.employeeContract', async () => {
      await client.query(
        [
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (1, 1, '2020/09/08', null, 'Employed', 'Games Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (2, 1, '2012/10/18', null, 'Employed', 'Software Developer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (3, 1, '2008/09/03', null, 'Employed', 'Producer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (4, 1, '2021/09/20', null, 'Employed', 'Sound Engineer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (5, null, '2021/08/26', '2022/04/05', 'Redundant', null)`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (6, 2, '1999/09/18', null, 'Employed', 'Games Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (7, 2, '2000/08/26', null, 'Employed', 'Level Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (8, 2, '1999/10/21', null, 'Employed', 'Systems Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (9, 2, '2000/10/09', null, 'Employed', 'Producer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (10, 2, '1998/09/24', null, 'Employed', 'Assistant Producer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (11, 2, '2012/10/03', null, 'Employed', 'Software Developer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (12, 2, '2021/10/19', null, 'Employed', 'Quality and Assurance')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (13, 2, '2021/09/20', null, 'Employed', 'Games Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (14, 2, '2021/08/25', null, 'Employed', 'Sound Engineer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (15, 2, '2021/08/22', null, 'Employed', 'Software Developer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (16, 2, '2015/08/24', null, 'Employed', 'Quality and Assurance')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (17, null, '2015/09/27', '2022/09/01', 'Resigned', null)`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (18, null, '2010/10/11', '2022/09/01', 'Resigned', null)`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (19, null, '2020/09/28', '2022/09/05', 'Resigned', null)`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (20, 3, '2007/08/25', null, 'Employed', 'Sound Engineer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (21, 3, '2001/09/09', null, 'Employed', 'Quality and Assurance')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (22, 3, '2007/08/25', null, 'Employed', 'Quality and Assurance')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (23, 3, '2020/10/14', null, 'Employed', 'Games Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (24, null, '2020/10/20', '2021/11/13', 'Resigned', null)`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (25, 3, '2021/08/21', null, 'Employed', 'Producer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (26, 3, '2021/10/26', null, 'Employed', 'Assistant Producer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (27, 3, '2016/09/20', null, 'Employed', 'Systems Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (28, 3, '2016/09/19', null, 'Employed', 'Software Developer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (29, 3, '2016/09/19', null, 'Employed', 'Software Developer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (30, 3, '2019/10/14', null, 'Employed', 'Software Developer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (31, 3, '2019/08/25', null, 'Employed', 'Games Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (32, 3, '2020/10/12', null, 'Employed', 'Producer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (33, 3, '2021/09/02', null, 'Employed', 'Quality and Assurance')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (34, null, '2015/08/28', '2022/05/30', 'Resigned', null)`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (35, 4, '2020/10/18', null, 'Employed', 'Games Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (36, 4, '2020/10/19', null, 'Employed', 'Sound Engineer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (37, 4, '2021/10/06', null, 'Employed', 'Producer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (38, 4, '2021/10/09', null, 'Employed', 'Software Developer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (39, null, '2011/09/12', '2022/05/30', 'Retired', null)`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (40, 5, '2015/10/14', null, 'Employed', 'Producer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (41, 5, '2015/10/31', null, 'Employed', 'Assistant Producer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (42, 5, '2015/10/09', null, 'Employed', 'Games Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (43, 5, '2018/09/18', null, 'Employed', 'Systems Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (44, 5, '2021/08/27', null, 'Employed', 'Sound Engineer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (45, 6, '2007/10/12', null, 'Employed', 'Games Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (46, 6, '2021/10/09', null, 'Employed', 'Games Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (47, 6, '2010/09/08', null, 'Employed', 'Games Design')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (48, 6, '2011/10/07', null, 'Employed', 'Software Developer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (49, 6, '2011/09/05', null, 'Employed', 'Producer')`,
          `INSERT INTO bohemia."employeeContract" ("employeeFK", "studioFK", "startDate", "endDate", status, "currentRole") VALUES (50, 6, '2014/08/22', null, 'Employed', 'Quality and Assurance')`
        ].join(';')
      );

      const res = await client.query('SELECT * FROM bohemia."employeeContract"');

      expect(res.command).toBe('SELECT');
      expect(res.rowCount).toBe(50);

      res.rows.forEach((row) => {
        expect(row).toHaveProperty('employeeFK');
        expect(row).toHaveProperty('studioFK');
        expect(row).toHaveProperty('startDate');
        expect(row).toHaveProperty('endDate');
        expect(row).toHaveProperty('status');
        expect(row).toHaveProperty('currentRole');
      });
    });

    test('INTO bohemia.projectAssignment', async () => {
      await client.query(
        [
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (1, 1, 'In Development')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (2, 1, 'Development Cancelled')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (3, 1, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (4, 1, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (5, 1, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (6, 1, 'In Development')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (7, 1, 'Development Cancelled')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (8, 1, 'Pitching')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (9, 2, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (10, 2, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (11, 2, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (12, 2, 'Development Cancelled')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (13, 2, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (14, 2, 'In Development')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (15, 2, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (16, 2, 'Cancelled')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (17, 3, 'Pitching')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (18, 3, 'Pitching')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (19, 3, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (20, 3, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (21, 3, 'Cancelled')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (22, 3, 'In Development')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (23, 3, 'In Development')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (24, 4, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (25, 4, 'Cancelled')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (26, 4, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (27, 4, 'In Development')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (28, 5, 'In Development')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (29, 5, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (30, 5, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (31, 5, 'Pitching')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (32, 5, 'Pitching')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (33, 5, 'Development Paused')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (34, 5, 'Cancelled')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (35, 6, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (36, 6, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (37, 6, 'Cancelled')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (38, 6, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (39, 6, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (40, 6, 'Published')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (41, 6, 'In Development')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (42, 6, 'In Development')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (43, 6, 'Pitching')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (44, 6, 'Pitching')`,
          `INSERT INTO bohemia."projectAssignment" ("projectFK", "studioFK", status) VALUES (45, 6, 'Published')`
        ].join(';')
      );

      const res = await client.query(`SELECT * FROM bohemia."projectAssignment"`);
      expect(res.rows).toHaveLength(45);

      res.rows.forEach((row) => {
        expect(row).toHaveProperty('projectFK');
        expect(row).toHaveProperty('studioFK');
        expect(row).toHaveProperty('status');
      });
    });
  });
});
