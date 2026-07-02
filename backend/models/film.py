from sqlalchemy import Column, Integer, String, Float, Text, Boolean
from database import Base

class Film(Base):
    __tablename__ = "films"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True)
    title = Column(String, nullable=False)
    original_title = Column(String)
    overview = Column(Text)
    poster_path = Column(String)
    backdrop_path = Column(String)
    release_date = Column(String)
    runtime = Column(Integer)
    vote_average = Column(Float)
    genres = Column(String)
    age_rating = Column(String)
    director = Column(String)
    cast_list = Column(String)
    is_upcoming = Column(Boolean, default=False)