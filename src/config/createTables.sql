create table if not exists factions (
	id int not null auto_increment,
	name varchar(50),
	gameId int,
	primary key (id)
);

create table if not exists games (
	id int not null auto_increment,
	name varchar(50),
	primary key (id)
);

create table if not exists units (
	id int not null auto_increment,
	name varchar(50),
	numerOfModels int,
	cost int,
	factionId int,
	primary key (id)
);

create table if not exists unit_abilities (
	id int not null auto_increment,
	name varchar(50),
	text varchar(8000),
	primary key (id)
);

create table if not exists unit_to_ability (
	id int not null auto_increment,
	unitId int,
	unitAbilityId int,
	primary key (id)
);

create table if not exists addons (
	id int not null auto_increment,
	text varchar(50),
	cost int,
	typeid int,
	itemIdToRemove int,
	itemIdToAdd int,
	amount int,
	addonLevelId int,
	times int default 1, --The max number of times an addon can be taken
	primary key (id)
);

create table if not exists addon_mutexes (
	id int not null auto_increment,
	firstId int,
	secondId int,
	primary key (id)
);

create table if not exists addon_types (
	id int not null auto_increment,
	name varchar(30),
	primary key (id)
);

create table if not exists addon_level (
	id int not null auto_increment,
	name varchar(20),
	primary key (id)
);

create table if not exists unit_to_addon (
	id int not null auto_increment,
	unitId int,
	addonId int,
	primary key (id)
);

create table if not exists gear (
	id int not null auto_increment,
	name varchar(50),
	cost int,
	gearRangeId int,
	primary key (id)
);

create table if not exists gear_abilities (
	id int not null auto_increment,
	text varchar(8000),
	primary key (id)
);

create table if not exists gear_to_abilities (
	id int not null auto_increment,
	gearId int,
	abilityId int,
	primary key (id)
);

create table if not exists gear_to_keywords (
	id int not null auto_increment,
	gearId int,
	keywordId int,
	primary key (id)
);

create table if not exists gear_keywords (
	id int not null auto_increment,
	name varchar(50),
	primary key (id)
);

create table if not exists gear_range (
	id int not null auto_increment,
	rangeType varchar(50),
	primary key (id)
);

create table if not exists unit_to_gear (
	id int not null auto_increment,
	unitId int,
	gearId int,
	primary key (id)
);

create table if not exists powers (
	id int not null auto_increment,
	name varchar(50),
	text varchar(8000),
	tableSetId int,
	primary key (id)
);

--Some powers have an ability that summons
--One effect out of a table of multiple.
create table if not exists power_table (
	id int not null auto_increment,
	setId int,
	name varchar(50),
	effect varchar(150),
	primary key (id)
);

create table if not exists unit_to_known_powers (
	id int not null auto_increment,
	unitId int,
	powerId int,
	primary key (id)
);

create table if not exists power_to_set (
	id int not null auto_increment,
	powerId int,
	setId int,
	primary key (id)
);

create table if not exists unit_to_options_powers (
	id int not null auto_increment,
	unitId int,
	amount int,
	setId int,
	primary key (id)
);

