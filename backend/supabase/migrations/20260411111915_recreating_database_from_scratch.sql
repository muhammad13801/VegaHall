drop schema public cascade;
create schema public;

create table users (
  id serial primary key,
  first_name varchar(30) not null,
  last_name varchar(30) not null,
  gender varchar(10),
  date_of_birth date,
  email varchar(50) unique not null,
  password varchar(60) not null,
  phone_number varchar(16) unique not null,
  role varchar(10) not null check (role in ('customer','owner','admin')),
  status varchar(10) default 'pending' check (status in ('pending','active','suspended')),
  code varchar(5),
  attempts_left int,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table halls (
  id serial primary key,
  owner_id int not null,
  hall_name varchar(50) not null,
  capacity int not null,
  city varchar(30) not null,
  address varchar(100),
  latitude numeric,
  longitude numeric,
  description text,
  base_price int not null,
  status varchar(10) default 'active' check (status in ('active','suspended')),

  foreign key (owner_id) references users(id) on delete cascade
);

create table bookings (
  id serial primary key,
  hall_id int not null,
  customer_id int not null,
  booking_date date not null,
  guests_number int not null,
  proposed_date date,
  status varchar(15) check (
    status in ('confirmed','rescheduled','cancelled')
  ),

  foreign key (hall_id) references halls(id) on delete cascade,
  foreign key (customer_id) references users(id) on delete cascade
);

create table services (
  id serial primary key,
  name varchar(100) unique not null
);

create table hall_services (
  id serial primary key,
  hall_id int not null,
  service_id int not null,
  price int not null,

  unique (hall_id, service_id),

  foreign key (hall_id) references halls(id) on delete cascade,
  foreign key (service_id) references services(id)
);

create table booking_services (
  id serial primary key,
  booking_id int not null,
  service_id int not null,
  price int not null,

  foreign key (booking_id) references bookings(id) on delete cascade,
  foreign key (service_id) references services(id)
);

create table meal_types (
  id serial primary key,
  name varchar(100) unique not null
);

create table meal_options (
  id serial primary key,
  hall_id int not null,
  meal_type_id int not null,
  price_per_person int not null,

  unique (hall_id, meal_type_id),

  foreign key (hall_id) references halls(id) on delete cascade,
  foreign key (meal_type_id) references meal_types(id)
);

create table booking_meals (
  id serial primary key,
  booking_id int not null,
  meal_type_id int not null,
  price_per_person int not null,

  foreign key (booking_id) references bookings(id) on delete cascade,
  foreign key (meal_type_id) references meal_types(id)
);

create table notifications (
  id serial primary key,
  user_id int not null,
  title varchar(30) not null,
  content text not null,
  notification_type varchar(20),
  channel varchar(10),
  sent boolean default false,
  created_at timestamptz default now(),

  foreign key (user_id) references users(id) on delete cascade
);

create table customer_payments (
  id serial primary key,
  customer_id int not null,
  booking_id int not null,
  amount int not null,
  type varchar(10) check (type in ('payment','refund')),
  status varchar(10) check (status in ('pending','success','failed')),
  payment_intent_id varchar(255),
  created_at timestamptz default now(),

  foreign key (customer_id) references users(id),
  foreign key (booking_id) references bookings(id)
);

create table hall_payments (
  id serial primary key,
  owner_id int not null,
  hall_id int not null,
  amount int not null,
  status varchar(10) check (status in ('pending','success','failed')),
  payment_intent_id varchar(255),
  created_at timestamptz default now(),

  foreign key (owner_id) references users(id),
  foreign key (hall_id) references halls(id)
);

create table media (
  id serial primary key,
  hall_id int not null,
  type varchar(10) check (type in ('image','video')),
  url varchar(255) not null,

  foreign key (hall_id) references halls(id) on delete cascade
);

create table ratings (
  id serial primary key,
  customer_id int not null,
  hall_id int not null,
  booking_id int not null,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),

  unique (booking_id),

  foreign key (customer_id) references users(id),
  foreign key (hall_id) references halls(id),
  foreign key (booking_id) references bookings(id)
);

create table favorites (
  id serial primary key,
  customer_id int not null,
  hall_id int not null,

  unique (customer_id, hall_id),

  foreign key (customer_id) references users(id),
  foreign key (hall_id) references halls(id)
);

create table sessions (
  id uuid primary key,
  user_id int not null,
  last_activity timestamptz default now(),

  foreign key (user_id) references users(id) on delete cascade
);

create table service_requests (
  id serial primary key,
  owner_id int not null,
  name varchar(100) not null,
  status varchar(10) default 'pending' check (status in ('pending','approved','rejected')),

  foreign key (owner_id) references users(id)
);

create table meal_requests (
  id serial primary key,
  owner_id int not null,
  name varchar(100) not null,
  status varchar(10) default 'pending' check (status in ('pending','approved','rejected')),

  foreign key (owner_id) references users(id)
);

create table secondary_contacts (
  id serial primary key,
  hall_id int not null,
  first_name varchar(30),
  last_name varchar(30),
  phone_number varchar(16),

  foreign key (hall_id) references halls(id) on delete cascade
);