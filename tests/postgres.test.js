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

    test('SEQUENCE THEN TABLE bohemia.employee', async () => {
      const seq = await client.query('CREATE SEQUENCE employee_seq start 1 increment 1');

      expect(seq.command).toBe('CREATE');
      expect(seq.rowCount).toBe(null);

      const res = await client.query(
        `CREATE TABLE bohemia.employee (${[
          '"employeeId" bigserial not null primary key',
          '"firstName" varchar(255) not null',
          '"lastName" varchar(255) not null',
          '"addressFK" bigint not null constraint employee_address_addressId_fk references bohemia.address',
          'email varchar(255) not null',
          'phone int not null',
          '"alternatePhone" int not null',
          '"currentProject" varchar(255) not null',
          '"pastProject" varchar(1000) not null'
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
          'description varchar(1000) not null',
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
          '"addressFK" bigint not null constraint studio_address_addressId_fk references bohemia.address',
          '"studioHead" varchar(255) not null',
          'phone int not null',
          '"alternatePhone" int not null',
          'email varchar(255) not null',
          'platform varchar(100) not null'
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
        `CREATE TABLE bohemia.\"employeeContract\" (${[
          '"contractId" bigserial not null primary key',
          '"employeeFK" bigint not null constraint employeeContract_employee_employeeId_fk references bohemia.employee',
          '"studioFK" bigint not null constraint employeeContract_studio_studioId_fk references bohemia.studio',
          '"startDate" date default current_date not null',
          '"endDate" date null',
          'status varchar(50) not null',
          '"currentRole" varchar(50) not null'
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
        `CREATE TABLE bohemia.\"projectAssignment\" (${[
          '"assignmentId" bigserial not null primary key',
          '"employeeFK" bigint not null constraint projectAssignment_employee_employeeId_fk references bohemia.employee',
          '"projectFK" bigint not null constraint projectAssignment_project_projectId_fk references bohemia.project',
          '"startDate" date default current_date not null',
          '"endDate" date null',
          'status varchar(50) not null'
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
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Feng Shui Simulator', 'A unique take on gardening simuators with a JPG twist.', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Feng Shui Simulator: Shedded', 'An expansion pack that enables you to build your very own shed!', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Feng Shui Simulator: Yasai', 'An expansion that provides 50 new vegetables to grow in your very own digital garden.', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Feng Shui Simulator: Garden Pests', 'An expansion pack that adds new game mechanics to protect your garden from birds, bunnies and blight.', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Origami Battler', 'Collect and raise your own creature, made from folded paper, and battle them with other folded paper monsters.', 'Console', 'Japanese RPG')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Heap Destruction', 'Starting off with nothing, you use your tools to create… something. Then destroy it and start again! In 3D.', 'PC', 'Sandbox')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Speed of Sound', 'Build your own spaceship and travel the stars, finding new parts and enhancements.', 'PC', 'Sandbox')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Earthendion', 'Starting off with nothing, you use your tools to create… something. Then destroy it and start again! In 2D.', 'PC', 'Sandbox')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Simon''s Sandbox', 'Originally a mod based on Valve''s Source Engine, Simon''s Sandbox is now a fully standalone sandbox game.', 'PC', 'Sandbox')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Ninja''s Resolution', 'Jump into the past and experienced an alternative history through the eyes of your ninja ancestors.', 'Console', '3rd Person Action Adventure')`,
          `INSERT INTO bohemia.project ("projectName", description, platform, genre) VALUES ('Light Hearts', 'Battle through gothic environments, using tactics and strategies to defeat reanimated monsters.', 'Console', '3rd Person Action Adventure')`,
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
      await client.query([
        `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('12 Main Street, Canterbury', 'CT1 1AA')`,
        `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('2 Central Avenue, London', 'W1 1CJ')`,
        `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('192 Bridge Road, London', 'SE2 2PQ')`,
        `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('19 The Lanes, Portsmouth', 'PO1 1BA')`,
        `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('55 Barnham Road, Gilford', 'BT63 6QU')`,
        `INSERT INTO bohemia.address ("addressLine", "postCode") VALUES ('Ela Mill, Cort St, Bury', 'BL9 7BW')`
      ].join(';'));

      const res = await client.query('SELECT * FROM bohemia.address');

      expect(res.command).toBe('SELECT');
      expect(res.rowCount).toBe(6);
    });
    
    test('INTO bohemia.studio', async () => {
      await client.query(
        [
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternatePhone", email) VALUES ('Fuzzy Sheep Studios', 'Specialises in porting games from Bohemia Group studios to Android and iOS platforms including smartphones and tablets.', 'Mobile', 'William Butcher', 1, '1227555666', '07700 900445', 'will.butcher@fuzzysheep.com')`,
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternatePhone", email) VALUES ('Ego Applications', 'A software studio that became famous for Mood, the grandfather of First Person Shooter games, released in the 1990s.', 'PC', 'Annie January', 2,'8006133589', '07700 900678', 'annie.january@egoapps.co.uk' )`,
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternatePhone", email) VALUES ('Dattebayo!', 'A UK based developer who focuses on translating and releasing Japanese anime-based videogames for the western audience.' , 'Console', 'Ashleigh Cohen', 3, '1614960267', '07700 900321', 'ashleigh.cohan@dattebayo.com')`,
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternatePhone", email) VALUES ('DojoKun', 'Known for their creative sandbox games that use voxels instead of polygons with randomly generated environments.', 'PC', 'Reggie Franklin', 4, '2011151612', '07700 900175', 'reggie.franklin@dojokun.net')`,
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternatePhone", email) VALUES ('Big Zebra Solutions', 'Recently secured funding from Sony to create a AAA 3rd person adventure game. Their previous titles were minimalist art-as-games experiences.', 'Console', 'Maggie Shaw', 5, '1483960457', '07700 900667', 'maggie.shaw@bigzebrasolutions.com')`,
          `INSERT INTO bohemia.studio("studioName", description, platform, "studioHead", "addressFK", phone, "alternatePhone", email) VALUES ('Unhinged', 'A small team who create games using assets from 3D model repositories. Unhinged concentrate mainly on games that make use of their in-house Eagle Engine.', 'PC', 'Yasmin Singh', 6, '1614960928', '07700 900299', 'yasmin.singh@unhinged.co.uk')`,
        ].join(';')
      );

      const res = await client.query('SELECT * FROM bohemia.studio');

      expect(res.command).toBe('SELECT');
      expect(res.rowCount).toBe(6);
    });
  });
});
