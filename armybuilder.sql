-- MySQL dump 10.16  Distrib 10.1.44-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: mysql.alexrinehart.net    Database: armybuilder
-- ------------------------------------------------------
-- Server version	5.7.29-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addon_mutexes`
--

DROP TABLE IF EXISTS `addon_mutexes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addon_mutexes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstId` int(11) DEFAULT NULL,
  `secondId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addon_mutexes`
--

LOCK TABLES `addon_mutexes` WRITE;
/*!40000 ALTER TABLE `addon_mutexes` DISABLE KEYS */;
/*!40000 ALTER TABLE `addon_mutexes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `addon_types`
--

DROP TABLE IF EXISTS `addon_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addon_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addon_types`
--

LOCK TABLES `addon_types` WRITE;
/*!40000 ALTER TABLE `addon_types` DISABLE KEYS */;
INSERT INTO `addon_types` VALUES (1,'replace item'),(2,'increase model number'),(3,'direct'),(4,'add item');
/*!40000 ALTER TABLE `addon_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `addons`
--

DROP TABLE IF EXISTS `addons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` varchar(50) DEFAULT NULL,
  `cost` int(11) DEFAULT NULL,
  `typeid` int(11) DEFAULT NULL,
  `itemIdToRemove` int(11) DEFAULT NULL,
  `itemIdToAdd` int(11) DEFAULT NULL,
  `addonLevelId` int(11) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `times` int(11) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addons`
--

LOCK TABLES `addons` WRITE;
/*!40000 ALTER TABLE `addons` DISABLE KEYS */;
INSERT INTO `addons` VALUES (1,'Trade auto bolt rifle for power sword',0,1,2,10,1,NULL,1),(2,'Add a second Primaris Lietanant',0,2,NULL,NULL,2,1,1),(3,'Add an extra 10 Poxwalkers',0,2,NULL,NULL,2,10,1),(4,'Add an extra 2 Plague Marines',0,2,NULL,NULL,2,2,1),(5,'Add an extra 5 Plague Marines',0,2,NULL,NULL,2,5,1),(6,'Toxin Sacs',8,3,NULL,NULL,1,NULL,1),(7,'Adrenal Glands',5,3,NULL,NULL,1,NULL,1),(8,'Add an extra Genestealer',10,2,NULL,NULL,2,1,1),(9,'Add an acid Maw',0,4,NULL,31,1,NULL,1),(10,'Add flesh hooks',0,4,NULL,32,1,NULL,1),(11,'Add scything talons',0,4,NULL,29,1,NULL,1);
/*!40000 ALTER TABLE `addons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factions`
--

DROP TABLE IF EXISTS `factions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `factions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `gameId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factions`
--

LOCK TABLES `factions` WRITE;
/*!40000 ALTER TABLE `factions` DISABLE KEYS */;
INSERT INTO `factions` VALUES (1,'Death Guard',1),(2,'Space Marines',1),(3,'Tyranids',1),(4,'Adeptus Mechanicus',1);
/*!40000 ALTER TABLE `factions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES (1,'Warhammer 40k 8th edition');
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gear`
--

DROP TABLE IF EXISTS `gear`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gear` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `cost` int(11) DEFAULT NULL,
  `gearRangeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gear`
--

LOCK TABLES `gear` WRITE;
/*!40000 ALTER TABLE `gear` DISABLE KEYS */;
INSERT INTO `gear` VALUES (1,'Assault bolter',7,2),(2,'Auto bolt rifle',0,2),(3,'Bolt pistol',0,2),(4,'Bolt rifle',0,2),(5,'Boltstorm gauntlet',33,1),(6,'Frag grenade',0,3),(7,'Krak grenade',0,3),(8,'Plasma incinerator',17,2),(9,'Master-crafted power sword',17,1),(10,'Power sword',4,1),(11,'Plaguespitter',17,2),(12,'Plague probe',29,1),(13,'Plaguereaper',45,2),(14,'Corrupted staff',19,1),(15,'Blight grenade',0,3),(16,'Plasma pistol',7,2),(17,'Cursed plague bell',9,2),(18,'Improvised weapon',0,2),(19,'Plaguesword',3,1),(20,'Power fist',29,1),(21,'Plasma gun',13,2),(22,'Plague knife',0,1),(23,'Boltgun',0,2),(24,'Acid Spray',25,2),(25,'Fleshborer Hive',15,2),(26,'Rupture Cannon',49,2),(27,'Stinger salvo',8,2),(28,'Powerful limbs',0,1),(29,'Scything Talons',0,1),(30,'Rending Claws',2,1),(31,'Acid Maw',0,1),(32,'Flesh hooks',2,1),(34,'Arc claw',4,1),(35,'Arc maul',5,1),(36,'Chordclaw',3,1),(37,'Electroleech stave',0,1),(38,'Electrostatic gauntlets',0,1),(39,'Hydraulic claw',8,1),(40,'Kastelan fists',35,1),(41,'Omnissian axe',0,1),(42,'Power fist (adeptus mechanicus)',20,1),(43,'Reaper chainsword',30,1),(44,'Servo-arm',12,1),(45,'Taser goad',6,1),(46,'Taser lance',9,1),(47,'Thunderstrike gauntlet',35,1),(48,'Titanic feet',0,1),(49,'Transonic blades',7,1),(50,'Transonic razor',2,1),(51,'Arc pistol',3,2),(52,'Arc rifle',4,2),(53,'Avenger gatling cannon',95,2),(54,'Cognis flamer',10,2),(55,'Cognis heavy stubber',5,2),(56,'Eradication beamer',30,2),(57,'Flechette blaster',0,2),(58,'Galvanic rifle',0,2),(59,'Gamma pistol',10,2),(60,'Heavy arc rifle',8,2),(61,'Heavy bolter',10,2),(62,'Heavy flamer',17,2),(63,'Heavy grav-cannon',30,2),(64,'Heavy phosphor blaster',15,2),(65,'Heavy stubber',4,2),(66,'Icarus array',40,2),(67,'Incdendine combustor',21,2),(68,'Ironstorm missile pod',16,2),(69,'Laspistol',0,2),(70,'Macrostubber',2,2),(71,'Meltagun',17,2),(72,'Multi-melta',27,2),(73,'Neutron laser',45,2),(74,'Phosphor blast pistol',4,2),(75,'Phosphor blaster',8,2),(76,'Phosphor serpenta',6,2),(77,'Plasma caliver',14,2),(78,'Plasma cannon',21,2),(79,'Plasma culverin',27,2),(80,'Radium carbine',0,2),(81,'Radium jezzail',4,2),(82,'Radium pistol',1,2),(83,'Rapid-fire battle cannon',100,2),(84,'Stormspear rocket pod',45,2),(85,'Stubcarbine',2,2),(86,'Thermal cannon',76,2),(87,'Torsion cannon',22,2),(88,'Transuranic arquebus',25,2),(89,'Twin cognis autocannon',25,2),(90,'Twin cognis lascannon',45,2),(91,'Twin heavy phosphor blaster',30,2),(92,'Twin Icarus autocannon',30,2),(93,'Volkite blaster',8,2);
/*!40000 ALTER TABLE `gear` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gear_abilities`
--

DROP TABLE IF EXISTS `gear_abilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gear_abilities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` varchar(8000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gear_abilities`
--

LOCK TABLES `gear_abilities` WRITE;
/*!40000 ALTER TABLE `gear_abilities` DISABLE KEYS */;
INSERT INTO `gear_abilities` VALUES (3,'If a model is making a close combat attack with a boltstorm guantlet, you must subtract 1 from the hit roll.'),(4,'Each time a model fires a plasma incinerator, it can supercharge the weapon before firing. If it does so, increase the Strength and Damage of the weapon by 1 this turn. If you roll any hit rolls of 1 when firing a supercharged plasma incinerator, the firing model is slain as the weapon explodes.'),(5,'You can re-roll any wound rolls of 1 when attacking with a plague weapon. In addition, a plaguespitter automatically hits its target - there is no need to make hit rolls.'),(6,'You can re-roll any wound rolls of 1 when attacking with a plague weapon.'),(7,'Each time a model fires a plasma pistol, it can supercharge the weapon before firing. If it does so, increase the Strength and Damage of the weapon by 1 this turn. If you roll any hit rolls of 1 when firing a supercharged plasma pistol, the firing model is slain as the weapon explodes.'),(8,'You can re-roll any wound rolls of 1 when attacking with a plague weapon. You can also re-roll all failed wound rolls when resolving attacks with this weapon.'),(9,'If a model is attacking with a power fist, you must subtract 1 from the hit roll'),(10,'Each time a model fires a plasma gun, it can supercharge the weapon before firing. If it does so, increase the Strength and Damage of the weapon by 1 this turn. If you roll any hit rolls of 1 when firing a supercharged plasma gun, the firing model is slain as the weapon explodes.'),(11,'This weapon automatically hits its target'),(12,'You can re-roll hit rolls of 1 for this weapon'),(13,'Each time you make a wound roll of 6+ for this weapon, that hit is resolved with an AP of -4.'),(14,'This weapon can be fired within 1\" of an enemy unit, and can target enemy within 1\" of friendly units.');
/*!40000 ALTER TABLE `gear_abilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gear_keywords`
--

DROP TABLE IF EXISTS `gear_keywords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gear_keywords` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gear_keywords`
--

LOCK TABLES `gear_keywords` WRITE;
/*!40000 ALTER TABLE `gear_keywords` DISABLE KEYS */;
/*!40000 ALTER TABLE `gear_keywords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gear_range`
--

DROP TABLE IF EXISTS `gear_range`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gear_range` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rangeType` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gear_range`
--

LOCK TABLES `gear_range` WRITE;
/*!40000 ALTER TABLE `gear_range` DISABLE KEYS */;
INSERT INTO `gear_range` VALUES (1,'melee'),(2,'ranged'),(3,'grenade');
/*!40000 ALTER TABLE `gear_range` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gear_to_abilities`
--

DROP TABLE IF EXISTS `gear_to_abilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gear_to_abilities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gearId` int(11) DEFAULT NULL,
  `abilityId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gear_to_abilities`
--

LOCK TABLES `gear_to_abilities` WRITE;
/*!40000 ALTER TABLE `gear_to_abilities` DISABLE KEYS */;
INSERT INTO `gear_to_abilities` VALUES (1,8,4),(2,5,3),(3,11,5),(4,12,6),(5,13,6),(6,15,6),(7,17,6),(8,16,7),(9,19,8),(10,20,9),(11,21,10),(12,22,6),(13,24,11),(14,29,12),(15,30,13),(16,32,14);
/*!40000 ALTER TABLE `gear_to_abilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gear_to_keywords`
--

DROP TABLE IF EXISTS `gear_to_keywords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gear_to_keywords` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gearId` int(11) DEFAULT NULL,
  `keywordId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gear_to_keywords`
--

LOCK TABLES `gear_to_keywords` WRITE;
/*!40000 ALTER TABLE `gear_to_keywords` DISABLE KEYS */;
/*!40000 ALTER TABLE `gear_to_keywords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_to_addon`
--

DROP TABLE IF EXISTS `model_to_addon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_to_addon` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `modelId` int(11) DEFAULT NULL,
  `addonId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_to_addon`
--

LOCK TABLES `model_to_addon` WRITE;
/*!40000 ALTER TABLE `model_to_addon` DISABLE KEYS */;
INSERT INTO `model_to_addon` VALUES (1,2,1);
/*!40000 ALTER TABLE `model_to_addon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_to_gear`
--

DROP TABLE IF EXISTS `model_to_gear`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_to_gear` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gearId` int(11) DEFAULT NULL,
  `modelId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_to_gear`
--

LOCK TABLES `model_to_gear` WRITE;
/*!40000 ALTER TABLE `model_to_gear` DISABLE KEYS */;
INSERT INTO `model_to_gear` VALUES (1,5,1),(2,9,1),(3,2,2),(4,3,2),(5,6,2),(6,7,2),(7,3,3),(8,4,3),(9,6,3),(10,7,3),(11,3,17),(12,4,17),(13,6,17),(14,7,17),(15,1,18),(16,1,18),(17,8,16),(18,3,16),(19,6,16),(20,7,16),(21,13,7),(22,17,8),(23,16,8),(24,7,8),(25,15,8),(26,11,9),(27,11,9),(28,12,9),(29,18,10),(30,14,11),(31,3,11),(32,15,11),(33,7,11),(34,3,4),(35,4,4),(36,6,4),(37,7,4),(38,1,5),(39,1,5),(40,8,6),(41,3,6),(42,6,6),(43,7,6);
/*!40000 ALTER TABLE `model_to_gear` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_to_known_powers`
--

DROP TABLE IF EXISTS `model_to_known_powers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_to_known_powers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unitId` int(11) DEFAULT NULL,
  `powerId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_to_known_powers`
--

LOCK TABLES `model_to_known_powers` WRITE;
/*!40000 ALTER TABLE `model_to_known_powers` DISABLE KEYS */;
INSERT INTO `model_to_known_powers` VALUES (1,14,1);
/*!40000 ALTER TABLE `model_to_known_powers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_to_options_powers`
--

DROP TABLE IF EXISTS `model_to_options_powers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_to_options_powers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unitId` int(11) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `setId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_to_options_powers`
--

LOCK TABLES `model_to_options_powers` WRITE;
/*!40000 ALTER TABLE `model_to_options_powers` DISABLE KEYS */;
INSERT INTO `model_to_options_powers` VALUES (1,14,2,1);
/*!40000 ALTER TABLE `model_to_options_powers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `models`
--

DROP TABLE IF EXISTS `models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `models` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `models`
--

LOCK TABLES `models` WRITE;
/*!40000 ALTER TABLE `models` DISABLE KEYS */;
INSERT INTO `models` VALUES (1,'Captain in Gravis Armour'),(2,'Primaris Lieutenant'),(3,'Primaris Ancient'),(4,'Intercessor'),(5,'Inceptor'),(6,'Hellblaster'),(7,'Lord of Contagion'),(8,'Noxious Blightbringer'),(9,'Foetid Bloat-Drone'),(10,'Poxwalker'),(11,'Malignant Plaguecaster'),(16,'Hellblaster Sergeant'),(17,'Intercessor Sergeant'),(18,'Inceptor Sergeant');
/*!40000 ALTER TABLE `models` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `power_sets`
--

DROP TABLE IF EXISTS `power_sets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `power_sets` (
  `setId` int(11) NOT NULL AUTO_INCREMENT,
  `setName` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`setId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `power_sets`
--

LOCK TABLES `power_sets` WRITE;
/*!40000 ALTER TABLE `power_sets` DISABLE KEYS */;
INSERT INTO `power_sets` VALUES (1,'Contagion discipline');
/*!40000 ALTER TABLE `power_sets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `power_table`
--

DROP TABLE IF EXISTS `power_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `power_table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setId` int(11) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `effect` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `power_table`
--

LOCK TABLES `power_table` WRITE;
/*!40000 ALTER TABLE `power_table` DISABLE KEYS */;
INSERT INTO `power_table` VALUES (1,1,'Flyblown Palsy','-1 Attack'),(2,1,'Muscular Atrophy','-1 Strength'),(3,1,'Liquefying Ague','-1 Toughness');
/*!40000 ALTER TABLE `power_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `power_to_set`
--

DROP TABLE IF EXISTS `power_to_set`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `power_to_set` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `powerId` int(11) DEFAULT NULL,
  `setId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `power_to_set`
--

LOCK TABLES `power_to_set` WRITE;
/*!40000 ALTER TABLE `power_to_set` DISABLE KEYS */;
INSERT INTO `power_to_set` VALUES (1,2,1),(2,3,1),(3,4,1);
/*!40000 ALTER TABLE `power_to_set` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `powers`
--

DROP TABLE IF EXISTS `powers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `powers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `text` varchar(8000) DEFAULT NULL,
  `tableSetId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `powers`
--

LOCK TABLES `powers` WRITE;
/*!40000 ALTER TABLE `powers` DISABLE KEYS */;
INSERT INTO `powers` VALUES (1,'Smite','Smite has a warp charge value of 5. If manifested, the closest visible enemy unit within 18\" of the psyker suffers D3 mortal wounds. If the result of the Psychic test was more than 10, the target suffers d6 mortal wounds instead.',NULL),(2,'Miasma of Pestilence','Miasma of Pestilence has a warp charge value of 6. If manifested, select a visible friendly unit within 18\" of the psyker. Unit the start of your next Psychic pahse, your opponent must subtract 1 from all hit rolls that target this unit.',NULL),(3,'Gift of Contagion','Gift of Contagion has a warp charge value of 7. If manifested, select a visible enemy unit within 18\" of the psyker and roll a d3. Consult the table below to discover what characteristics penalty all models in that unit suffer until the start of your next Psychic phase (this cannot reduce a characteristic to less than 1).',1),(4,'Plague Wind','Plague Wind has a warp charge value of 5. If manifested, select a visible enemy unit within 18\" of the psyker. Roll dice for each model in that unit - the unit suffers a mortal wound for each roll of 6.',NULL);
/*!40000 ALTER TABLE `powers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_abilities`
--

DROP TABLE IF EXISTS `unit_abilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit_abilities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `text` varchar(8000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_abilities`
--

LOCK TABLES `unit_abilities` WRITE;
/*!40000 ALTER TABLE `unit_abilities` DISABLE KEYS */;
INSERT INTO `unit_abilities` VALUES (1,'And They Shall Know No Fear','This unit can re-roll failed Morale Tests'),(2,'Iron halo','+4 invulnerable save'),(3,'Rites of Battle','You can re-roll all hit rolls of 1 made for one friendly <chapter> units that are within 6\" of this unit.'),(4,'Adeptus Astartes Banner <chapter>','Units within 6\" of any friendly <chapter> ancients gain +1 to their Leadership. In addition, roll a dice each time a <chapter> Infantry model is destroyed within 6\" of any friendly <chapter> Ancients, before removing the model as a casualty. On a 4+, that model musters one last surge of strength before succumbing to its wounds; it can either shoot with one of its weapons as if it were the Shooting phase, or make a single attack as if it were the Fight phase.'),(5,'Heavy Jump Pack','The sheer impact of a charging Inceptor can break through walls and shatter bones. Roll a dice each time an Inceptor finishes a charge move within 1\" of an enemy unit; on a 6, that unit suffers a mortal wound.'),(6,'Meteoric Descent','When you set up an Inceptor Squad during deployment, they can be set up in high orbit insterad of being placed on the battlefield. If they do so, they can use a meteoric descent to arrvie on the battlefield at the end of any of your Movement phases; when they do so set them up anywhere that is more than 9\" from any enemy model.'),(7,'Disgustingly Resilient','Each time a model in this unit loses a wound, roll a dice; on a roll of 5 or 6 the model does not lose that wound.'),(8,'Putrid Explosion','If a Foetid Bloat-drone is reduced to 0 wounds, roll a dice before removing the model from the playfield; on a roll of 4+ it explodes, and each unit within 7\" suffers 1 mortal wound.'),(9,'Daemonic','A Foetid Bloat-drone has a +5 invulnerable save.'),(10,'Nurgle\'s Gift','All Death Guard models within 7\" of a Lord of Contagion are surrounded by a deadly aura of plague and disease. Roll a dice for each enemy unit that is within 1\" of a such a model at the start of your turn. On a roll of 4+, that unit suffers a mortal wound.'),(11,'Cataphractii Armour','A Lord of Contagion has 4+ invulnerable save, but you must halve the result of the dice rolled when determining how far this model Advances.'),(12,'Teleport Strike','When you set up a Lord of Contagion during deployment, he can be set up in a teleportation chamber instead of being placed on the battlefield. If he does so, he can use a teleport strike to arrive on the battlefield at the end of any of your Movement phases; when he does so set him up anywhere that is more than 9\" from any enemy models.'),(13,'Pestitential Fallout','Each time a Malignant Plaguecaster successfully manifests a psychic power with a Psychic test of 7 or more, the nearest enemy unit within 7\" suffers a mortal wound after the effects of the psychic power have been resolved.'),(14,'Tocsin of Misery','Enemy units must subtract 1 from their Leadership whilst they are within 7\" of any Noxious Blightbringers (enemy Psykers must subtract 2 instead). In addition, if a Death Guard unit is within 7\" of any friendly Noxious Blightbringers when it Advances, roll two dice and discard the lowest result when determining how far that unit Advances.'),(15,'Curse of the Walking Pox','Each time an enemy model is slain by a Poxwalker in the Fight phase, add one model to the Poxwalker\'s unit.'),(16,'Mindless','Poxwalkers never have to take Morale tests'),(17,'Diseased Horde','You can add 1 to all hit rolls made for a Poxwalker in the Fight phase if its unit contains more than 10 models.'),(18,'Instinctive Behavior','Unless a <Hive Fleet> unit with this ability is within 24\" of any friendly <Hive Fleet> Synapse unit, you must subtract 1 from any hit rolls made for it when shooting any target other than the nearest visible enemy unit, and you must subtract 2 from its charge roll if it declares a charge against any unit other than the nearest enemy unit.'),(19,'Bio-tank','This model does not suffer the penalty to its hit rolls for moving and firing Heavy weapons'),(20,'Weapon Beast','If this model does not move in your Movement phase, it can shoot all of its weapons twice in the Shooting phase.'),(21,'Death Throes','If a Tyrannofex is reduced to 0 wounds, roll a dice before removing the model from the battlefield; on a 6 it lashes out in its death throes, and each unit within 3\" suffers D3 mortal wounds.'),(22,'Flurry of Claws','Genestealers have 4 Attacks instead of 3 whilst their unit has 10 or more models'),(23,'Lightning Reflexes','Genestealers have a 5+ invulnerable save.'),(24,'Swift and Deadly','Genestealers can charge even if they Advanced during their turn.'),(25,'Extended Carapaces','Genestealers with extended carapaces have a Save characteristic of 4+ but lose the Swift and Deadly ability.'),(26,'Infestation','If your army includes any units of Genestealers, you can place up to four infestation nodes anywhere in your deployment zone when your army deploys. You can set up any unit of Genestealers lurking, instead of setting them up on the battlefield. If an enemy model is ever within 9\" of an infestation node, the node is destroyed and removed from the battlefield. Whilst there are friendly infestation nodes on the battlefield, this unit can stop lurking: at the end of your Movement phase, set it up wholly within 6\" of a friendly infestation node. That infestation node is then removed from the battlefield. If this unit is still lurking when the last friendly infestation node is removed, this unit is destroyed.');
/*!40000 ALTER TABLE `unit_abilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_to_ability`
--

DROP TABLE IF EXISTS `unit_to_ability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit_to_ability` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unitId` int(11) DEFAULT NULL,
  `unitAbilityId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_to_ability`
--

LOCK TABLES `unit_to_ability` WRITE;
/*!40000 ALTER TABLE `unit_to_ability` DISABLE KEYS */;
INSERT INTO `unit_to_ability` VALUES (1,1,1),(2,1,2),(3,1,3),(4,2,1),(5,2,3),(6,6,4),(7,6,1),(8,7,1),(9,8,1),(10,8,5),(11,8,6),(12,9,1),(13,10,7),(14,10,10),(15,10,11),(16,10,12),(17,11,14),(18,12,7),(19,12,8),(20,12,9),(21,13,7),(22,13,15),(23,13,16),(24,13,17),(25,14,7),(26,14,13);
/*!40000 ALTER TABLE `unit_to_ability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_to_addon`
--

DROP TABLE IF EXISTS `unit_to_addon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit_to_addon` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unitId` int(11) DEFAULT NULL,
  `addonId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_to_addon`
--

LOCK TABLES `unit_to_addon` WRITE;
/*!40000 ALTER TABLE `unit_to_addon` DISABLE KEYS */;
INSERT INTO `unit_to_addon` VALUES (2,2,2),(3,13,3);
/*!40000 ALTER TABLE `unit_to_addon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_to_model`
--

DROP TABLE IF EXISTS `unit_to_model`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit_to_model` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unitId` int(11) DEFAULT NULL,
  `modelId` int(11) DEFAULT NULL,
  `modelCount` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_to_model`
--

LOCK TABLES `unit_to_model` WRITE;
/*!40000 ALTER TABLE `unit_to_model` DISABLE KEYS */;
INSERT INTO `unit_to_model` VALUES (1,1,1,1),(2,2,2,1),(3,6,3,1),(4,7,17,1),(5,7,4,4),(6,8,5,2),(7,8,18,1),(8,9,6,4),(9,9,16,1),(10,10,7,1),(11,11,8,1),(12,12,9,1),(13,13,10,10),(14,14,11,1);
/*!40000 ALTER TABLE `unit_to_model` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `units` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `factionId` int(11) DEFAULT NULL,
  `costPerModel` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units`
--

LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;
INSERT INTO `units` VALUES (1,'Captain in Gravis Armour',2,98),(2,'Primaris Lieutenants',2,60),(6,'Primaris Ancient',2,63),(7,'Intercessor Squad',2,24),(8,'Inceptor Squad',2,39),(9,'Hellblaster Squad',2,23),(10,'Lord of Contagion',1,139),(11,'Noxious Blightbringer',1,64),(12,'Foetid Bloat-Drone',1,143),(13,'Poxwalkers',1,6),(14,'Malignant Plaguecaster',1,95);
/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-07-25 22:17:07
