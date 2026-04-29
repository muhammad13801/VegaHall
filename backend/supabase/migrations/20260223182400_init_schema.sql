--
-- PostgreSQL database dump
--

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    hall_id integer NOT NULL,
    customer_id integer NOT NULL,
    booking_date date NOT NULL,
    status character varying(10) NOT NULL
);


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: favoritehalls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favoritehalls (
    customer_id integer CONSTRAINT favorirehalls_customer_id_not_null NOT NULL,
    hall_id integer CONSTRAINT favorirehalls_hall_id_not_null NOT NULL
);


--
-- Name: hall_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hall_services (
    id integer NOT NULL,
    hall_id integer NOT NULL,
    name character varying(30) NOT NULL,
    description character varying(50),
    status character varying(10) NOT NULL
);


--
-- Name: hall_services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hall_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hall_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hall_services_id_seq OWNED BY public.hall_services.id;


--
-- Name: halls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.halls (
    id integer NOT NULL,
    hall_name character varying(30) NOT NULL,
    location character varying(60) NOT NULL,
    description text,
    price integer NOT NULL,
    status character varying(10) NOT NULL,
    owner_id integer NOT NULL
);


--
-- Name: halls_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.halls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: halls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.halls_id_seq OWNED BY public.halls.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id integer NOT NULL,
    hall_id integer NOT NULL,
    type character varying(10) NOT NULL,
    url character varying(250) NOT NULL
);


--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(30) NOT NULL,
    content text NOT NULL,
    notification_type character varying(10) NOT NULL,
    channel character varying(10) NOT NULL,
    sent boolean NOT NULL,
    created_at date DEFAULT CURRENT_DATE NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    amount integer NOT NULL,
    type character varying(10) NOT NULL,
    status character varying(10) NOT NULL,
    created_at date DEFAULT CURRENT_DATE NOT NULL
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: pending_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pending_users (
    email character varying(50) NOT NULL,
    first_name character varying(30) NOT NULL,
    last_name character varying(30) NOT NULL,
    gender character varying(10) NOT NULL,
    date_of_birth date NOT NULL,
    password character varying(60) NOT NULL,
    phone_number character varying(16) NOT NULL,
    role character varying(10) NOT NULL,
    status character varying(10) NOT NULL,
    code character varying(5) NOT NULL,
    attempts_left integer DEFAULT 5 NOT NULL,
    expires_at bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ratings (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    hall_id integer NOT NULL,
    rating integer NOT NULL,
    comment text
);


--
-- Name: ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ratings_id_seq OWNED BY public.ratings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(30) NOT NULL,
    last_name character varying(30) NOT NULL,
    gender character varying(10) NOT NULL,
    date_of_birth date NOT NULL,
    email character varying(50) NOT NULL,
    password character varying(60) NOT NULL,
    phone_number character varying(16) NOT NULL,
    role character varying(10) NOT NULL,
    status character varying(10) NOT NULL,
    created_at date DEFAULT CURRENT_DATE NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: hall_services id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hall_services ALTER COLUMN id SET DEFAULT nextval('public.hall_services_id_seq'::regclass);


--
-- Name: halls id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.halls ALTER COLUMN id SET DEFAULT nextval('public.halls_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: ratings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings ALTER COLUMN id SET DEFAULT nextval('public.ratings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: favoritehalls favorirehalls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritehalls
    ADD CONSTRAINT favorirehalls_pkey PRIMARY KEY (customer_id, hall_id);


--
-- Name: hall_services hall_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hall_services
    ADD CONSTRAINT hall_services_pkey PRIMARY KEY (id);


--
-- Name: halls halls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.halls
    ADD CONSTRAINT halls_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: pending_users pending_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_users
    ADD CONSTRAINT pending_users_pkey PRIMARY KEY (email);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bookings bookings_hall_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_hall_id_fkey FOREIGN KEY (hall_id) REFERENCES public.halls(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: favoritehalls favorirehalls_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritehalls
    ADD CONSTRAINT favorirehalls_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: favoritehalls favorirehalls_hall_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritehalls
    ADD CONSTRAINT favorirehalls_hall_id_fkey FOREIGN KEY (hall_id) REFERENCES public.halls(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hall_services hall_services_hall_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hall_services
    ADD CONSTRAINT hall_services_hall_id_fkey FOREIGN KEY (hall_id) REFERENCES public.halls(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: halls halls_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.halls
    ADD CONSTRAINT halls_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: media media_hall_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_hall_id_fkey FOREIGN KEY (hall_id) REFERENCES public.halls(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ratings ratings_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ratings ratings_hall_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_hall_id_fkey FOREIGN KEY (hall_id) REFERENCES public.halls(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--