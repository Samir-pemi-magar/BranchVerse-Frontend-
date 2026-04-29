"use client";
import { getPreferences } from "@/src/Services/authapi";
import { GetPopularThisWeek } from "@/src/Services/storyApi";
import {
  GetAllStories,
  GetTrendingStories,
  GetPersonalizedStories,
  GetRecommendedStories,
  LikeStory,
} from "@/src/Services/storyApi";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import RecommendedStorycard from "@/src/component/RecommendedStorycard";
import Link from "next/link";
import {
  GetAllBookmarks,
  GetTopStories,
  GetTopWriters,
} from "@/src/Services/storyApi";
interface Author {
  _id: string;
  username: string;
}

interface Story {
  _id: string;
  title: string;
  cover: string;
  tags: string[];
  description: string;
  author: Author;
  views: number;
  likes: number;
  branchAllowed: boolean;
  createdAt: string;
  branchesCount: number;
}

interface BookmarkedStory {
  _id: string;
  title: string;
  cover: string;
  author: { username: string };
  branchesCount: number;
}

interface TopWriter {
  writer: string;
  totalScore: number;
  storiesCount: number;
  profilePicture: string | null;
}

export default function Home() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<string[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [trendingStories, setTrendingStories] = useState<Story[]>([]);
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);
  const [recommendedStories, setRecommendedStories] = useState<Story[]>([]);
  const [personalizedStories, setPersonalizedStories] = useState<Story[]>([]);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [popularStories, setPopularStories] = useState<Story[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    undefined,
  );
  const [bookmarkedStories, setBookmarkedStories] = useState<BookmarkedStory[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [topWriters, setTopWriters] = useState<TopWriter[]>([]);
  const [topStories, setTopStories] = useState<Story[]>([]);

  useEffect(() => {
    const fetchAllStories = async () => {
      try {
        const data = await GetAllStories();
        setStories(data.stories);
        const userId = data?.currentUserId;
        if (userId) {
          setCurrentUserId(userId);
        }
      } catch (err) {
        console.error("Failed to fetch all stories", err);
      }
    };
    const fetchPopular = async () => {
      try {
        const data = await GetPopularThisWeek();
        setPopularStories(data.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch popular stories", err);
      }
    };
    const fetchBookmarks = async () => {
      try {
        const data = await GetAllBookmarks(); // { stories: [], chapters: [] }
        setBookmarkedStories(data.stories || []);
      } catch (err) {
        console.error("Failed to fetch bookmarks", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchTopWriters = async () => {
      try {
        const data = await GetTopWriters();
        setTopWriters(data);
      } catch (err) {
        console.error("Failed to fetch top writers", err);
      }
    };

    const fetchTopStories = async () => {
      try {
        const data = await GetTopStories();
        setTopStories(data);
      } catch (err) {
        console.error("Failed to fetch top stories", err);
      }
    };

    fetchTopWriters();
    fetchTopStories();
    fetchBookmarks();

    fetchPopular();
    fetchAllStories();
  }, []);

  // =====================
  // Fetch user preferences
  // =====================
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await getPreferences();
        if (data?.preferences?.genres) {
          setPreferences(data.preferences.genres);
        }
      } catch (err) {
        console.error("Failed to fetch preferences", err);
      }
    };

    fetchPreferences();
  }, []);

  // =====================
  // Fetch trending stories
  // =====================
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await GetTrendingStories();
        setTrendingStories(data.slice(0, 5)); // top 5
      } catch (err) {
        console.error("Failed to fetch trending stories", err);
      }
    };

    fetchTrending();
  }, []);

  // =====================
  // Fetch recommended / personalized stories
  // =====================
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const data = await GetRecommendedStories();
        setRecommendedStories(data);
      } catch (err) {
        console.error("Failed to fetch recommended stories", err);
      }
    };

    const fetchPersonalized = async () => {
      try {
        const data = await GetPersonalizedStories();
        setPersonalizedStories(data);
      } catch (err) {
        console.error("Failed to fetch personalized stories", err);
      }
    };

    if (preferences.length > 0) {
      fetchRecommended();
      fetchPersonalized();
    }
  }, [preferences]);

  // =====================
  // Trending carousel interval
  // =====================
  useEffect(() => {
    if (trendingStories.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTrendingIndex((prev) => (prev + 1) % trendingStories.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [trendingStories]);

  const handleLikeStory = async (id: string) => {
    const res = await LikeStory(id); // { likes: number }

    setStories((prev) =>
      prev.map((story) =>
        story._id === id ? { ...story, likes: res.likes } : story,
      ),
    );
  };
  // auto-scroll effect
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || stories.length === 0) return;

    const interval = setInterval(() => {
      if (isHovered) return; // pause on hover
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
      if (Math.ceil(scroller.scrollLeft) >= maxScrollLeft) {
        scroller.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroller.scrollBy({ left: scroller.clientWidth, behavior: "smooth" });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [stories, isHovered]);

  return (
    <div className="py-[90px] w-full h-auto bg-white px-[90px] flex flex-col items-center">
      <div className="flex flex-row justify-between w-full px-20 items-center">
        <div className="flex flex-col gap-[75px]">
          <div className="flex flex-col gap-[30px]">
            <p className="w-[461px] text-[60px] leading-[60px] tracking-[-1px] wrap-normal font-bold">
              Welcome to BranchVerse
            </p>
            <p className="w-[478px] leading-7 wrap-normal font-bold text-[20px] text-[#837E7E]">
              Continue your narrative journey, explore new worlds, and connect
              with a vibrant community of storytellers.
            </p>
          </div>
          <div className="flex flex-row gap-[18px]">
            <button
              className="font-bold text-[14px] border-2 border-[#00B8AE] bg-white hover:bg-[#00B8AE] hover:text-white w-[148px] h-11 rounded-md cursor-pointer transition duration-200"
              onClick={() => router.push("/Users/StoryTitle")}
            >
              Start a Story
            </button>
            <button
              className="font-bold text-[14px] border-2 border-[#00B8AE] bg-white hover:bg-[#00B8AE] hover:text-white w-[167px] h-11 rounded-md cursor-pointer transition duration-200"
              onClick={() => router.push("/Users/StoryExplorer")}
            >
              Explore Stories
            </button>
          </div>
        </div>
        <div className="w-[550px] overflow-hidden">
          <div
            ref={scrollerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth py-4"
          >
            {stories.map((story) => {
              const coverSrc =
                story?.cover && process.env.NEXT_PUBLIC_BASEURL
                  ? `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`
                  : "/images/placeholder-cover.png";

              return (
                <Link
                  key={story._id}
                  href={`/Users/StoryPreview?id=${story._id}`}
                  className="relative flex-shrink-0 w-full h-[300px] rounded-2xl overflow-hidden snap-center cursor-pointer group shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Cover image */}
                  <img
                    src={coverSrc}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-110"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* Branchable badge */}
                  {story.branchAllowed && (
                    <div className="absolute top-3 left-3 bg-[#00B8AE] px-2 py-1 rounded text-white text-xs font-semibold z-10">
                      Branchable
                    </div>
                  )}

                  {/* Story title & author */}
                  <div className="absolute bottom-4 left-4 z-10">
                    <p className="text-white font-bold text-[20px] sm:text-[22px] md:text-[24px] line-clamp-2 max-w-[90%]">
                      {story.title}
                    </p>
                    <p className="text-gray-200 text-xs mt-1">
                      By {story.author.username} • {story.views} views
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-full h-fit py-[50px] items-center flex flex-col gap-[60px] bg-[#FAFAFB] mt-[110px]">
        <p className="font-bold text-[36px]">Recommended Stories</p>
        <div
          className="grid grid-cols-3 gap-6 w-full"
          style={{ paddingLeft: "62px", paddingRight: "62px" }}
        >
          {recommendedStories.map((story) => (
            <RecommendedStorycard
              key={story._id}
              story={story}
              handleLikeStory={handleLikeStory} // optional
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </div>
      <div className="w-full h-fit py-[50px] items-center flex flex-col gap-[60px] mt-[90px]">
        <p className="font-bold text-[36px]">Trending Now</p>
        <div className="px-[60px] flex flex-row justify-between w-full">
          {trendingStories.length > 0 &&
            (() => {
              const story = trendingStories[currentTrendingIndex];

              return (
                <div
                  key={story._id}
                  className="flex-shrink-0 rounded-2xl w-1/2 h-fit overflow-hidden shadow-md transition-all duration-500 bg-white"
                >
                  {/* IMAGE + BRANCHABLE BADGE */}
                  <div className="relative w-full">
                    {story.branchAllowed && (
                      <span className="absolute top-3 left-3 bg-[#00B8AE] text-white text-sm font-semibold px-3 py-1 rounded-md shadow">
                        Branchable
                      </span>
                    )}

                    <img
                      src={`${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`}
                      alt={story.title}
                      className="w-full h-[250px] object-cover rounded-t-2xl"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col justify-between items-start px-3 py-5 gap-3">
                    {/* TITLE + AUTHOR */}
                    <div>
                      <p className="font-bold text-[30px]">{story.title}</p>
                      <div className="flex flex-row gap-1 text-[17px] font-bold text-[#837E7E]">
                        <p>By</p>
                        <p>{story.author.username}</p>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-gray-600 text-[15px] line-clamp-2">
                      {story.description}
                    </p>

                    {/* TAGS */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {story.tags.slice(0, 4).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-200 rounded-full text-gray-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* STATS */}
                    <div className="flex flex-row items-center gap-6 font-bold mt-1">
                      {/* Views */}
                      <div className="flex gap-1 items-center text-gray-500">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M12 5c-7.633 0-10 7-10 7s2.367 
            7 10 7 10-7 10-7-2.367-7-10-7zm0 
            12c-2.761 0-5-2.239-5-5s2.239-5 
            5-5 5 2.239 5 5-2.239 5-5 
            5zm0-8a3 3 0 100 6 3 3 0 000-6z"
                          />
                        </svg>
                        <p className="text-[17px]">{story.views}</p>
                      </div>

                      {/* Likes */}
                      <div
                        className="flex gap-1 items-center text-red-500"
                        onClick={() => {
                          handleLikeStory(story._id);
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
            4.42 3 7.5 3c1.74 0 3.41.81 
            4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 
            22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 
            11.54L12 21.35z"
                          />
                        </svg>
                        <p className="text-[17px]">{story.likes}</p>
                      </div>

                      {/* Branches */}
                      <div className="flex gap-1 items-center text-[#00B8AE]">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M5 10.038C5.32593 9.70547 5.71491 9.44134 6.14419 9.26104C6.57347 9.08075 7.0344 8.98791 7.5 8.98798H9.5C10.0871 8.98818 10.6555 8.78178 11.1056 8.40495C11.5557 8.02813 11.8589 7.50491 11.962 6.92698C11.4934 6.79646 11.0885 6.49965 10.8229 6.09209C10.5574 5.68454 10.4495 5.19418 10.5194 4.71281C10.5893 4.23144 10.8323 3.79205 11.2028 3.47689C11.5733 3.16173 12.046 2.9924 12.5324 3.0006C13.0187 3.00881 13.4854 3.19397 13.8451 3.52145C14.2048 3.84892 14.4328 4.29626 14.4864 4.77971C14.5401 5.26317 14.4157 5.74961 14.1366 6.14798C13.8575 6.54635 13.4427 6.82934 12.97 6.94398C12.8591 7.78581 12.446 8.55862 11.8076 9.11846C11.1692 9.6783 10.3491 9.98697 9.5 9.98698H7.5C6.9088 9.98682 6.33666 10.1962 5.88519 10.5779C5.43373 10.9596 5.13215 11.489 5.034 12.072C5.50167 12.2015 5.9063 12.4966 6.17247 12.9024C6.43865 13.3082 6.54822 13.7968 6.48078 14.2774C6.41333 14.758 6.17346 15.1976 5.80586 15.5144C5.43827 15.8312 4.96803 16.0036 4.48278 15.9993C3.99753 15.9951 3.53036 15.8146 3.16834 15.4915C2.80632 15.1683 2.57414 14.7246 2.51506 14.2429C2.45599 13.7612 2.57405 13.2745 2.84725 12.8735C3.12045 12.4724 3.53015 12.1843 4 12.063V3.93698C3.52868 3.81528 3.11791 3.52587 2.8447 3.12298C2.5715 2.72009 2.45461 2.23139 2.51595 1.74848C2.57728 1.26557 2.81264 0.821613 3.17789 0.499819C3.54314 0.178025 4.01322 0.000488281 4.5 0.000488281C4.98679 0.000488281 5.45687 0.178025 5.82212 0.499819C6.18737 0.821613 6.42273 1.26557 6.48406 1.74848C6.5454 2.23139 6.42851 2.72009 6.15531 3.12298C5.8821 3.52587 5.47133 3.81528 5 3.93698V10.038Z"
                            fill="#00B8AE"
                          />
                        </svg>
                        <p className="text-[17px]">{story.branchesCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          <div className="border border-black/12 w-[569px] h-fit rounded-2xl px-5 py-7">
            <p className="font-bold text-[24px] mb-5">Popular this Week</p>
            <div className="flex flex-col gap-4">
              {popularStories.map((story) => (
                <div
                  key={story._id}
                  className="flex flex-row items-center gap-3"
                >
                  {/* Cover Image */}
                  <img
                    src={`${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`}
                    alt={story.title}
                    className="w-20 h-28 object-cover rounded-md"
                  />

                  {/* Info */}
                  <div className="flex flex-col">
                    <p className="font-bold text-[18px]">{story.title}</p>
                    <p className="text-gray-500 text-[14px]">
                      by {story.author.username}
                    </p>
                    <div className="flex flex-row gap-2 mt-1 items-center">
                      <p className="text-[#00B8AE] font-semibold">
                        {story.branchesCount} Branches
                      </p>
                      <p className="text-red-500 font-semibold">
                        {story.likes} Likes
                      </p>
                      <p className="text-gray-500">{story.views} Views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Bookmarks Section */}
      {!loading && bookmarkedStories.length > 0 && (
        <div className="flex flex-col gap-[60px] mt-[90px] w-full items-center py-[50px] h-fit bg-[#FAFAFB]">
          <p className="font-bold text-[36px]">Bookmarks</p>
          <div
            className="grid grid-cols-3 gap-3 w-full"
            style={{ paddingLeft: "62px", paddingRight: "62px" }}
          >
            {bookmarkedStories.map((story) => (
              <div
                key={story._id}
                className="flex flex-col gap-[5px] cursor-pointer"
                onClick={() =>
                  router.push(`/Users/StoryPreview?id=${story._id}`)
                }
              >
                {/* Cover Image */}
                <div className="w-full h-[200px] rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={`${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`}
                    alt={story.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div>
                  <div>
                    <p className="font-bold text-[25px] line-clamp-1">
                      {story.title}
                    </p>
                    <div className="flex flex-row gap-0.5 text-[14px] font-bold text-[#837E7E]">
                      <p>By</p>
                      <p>{story.author.username}</p>
                    </div>
                  </div>
                  <div className="flex flex-row gap-0.5 items-center text-[#00B8AE] mt-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 10.038C5.32593 9.70547 5.71491 9.44134 6.14419 9.26104C6.57347 9.08075 7.0344 8.98791 7.5 8.98798H9.5C10.0871 8.98818 10.6555 8.78178 11.1056 8.40495C11.5557 8.02813 11.8589 7.50491 11.962 6.92698C11.4934 6.79646 11.0885 6.49965 10.8229 6.09209C10.5574 5.68454 10.4495 5.19418 10.5194 4.71281C10.5893 4.23144 10.8323 3.79205 11.2028 3.47689C11.5733 3.16173 12.046 2.9924 12.5324 3.0006C13.0187 3.00881 13.4854 3.19397 13.8451 3.52145C14.2048 3.84892 14.4328 4.29626 14.4864 4.77971C14.5401 5.26317 14.4157 5.74961 14.1366 6.14798C13.8575 6.54635 13.4427 6.82934 12.97 6.94398C12.8591 7.78581 12.446 8.55862 11.8076 9.11846C11.1692 9.6783 10.3491 9.98697 9.5 9.98698H7.5C6.9088 9.98682 6.33666 10.1962 5.88519 10.5779C5.43373 10.9596 5.13215 11.489 5.034 12.072C5.50167 12.2015 5.9063 12.4966 6.17247 12.9024C6.43865 13.3082 6.54822 13.7968 6.48078 14.2774C6.41333 14.758 6.17346 15.1976 5.80586 15.5144C5.43827 15.8312 4.96803 16.0036 4.48278 15.9993C3.99753 15.9951 3.53036 15.8146 3.16834 15.4915C2.80632 15.1683 2.57414 14.7246 2.51506 14.2429C2.45599 13.7612 2.57405 13.2745 2.84725 12.8735C3.12045 12.4724 3.53015 12.1843 4 12.063V3.93698C3.52868 3.81528 3.11791 3.52587 2.8447 3.12298C2.5715 2.72009 2.45461 2.23139 2.51595 1.74848C2.57728 1.26557 2.81264 0.821613 3.17789 0.499819C3.54314 0.178025 4.01322 0.000488281 4.5 0.000488281C4.98679 0.000488281 5.45687 0.178025 5.82212 0.499819C6.18737 0.821613 6.42273 1.26557 6.48406 1.74848C6.5454 2.23139 6.42851 2.72009 6.15531 3.12298C5.8821 3.52587 5.47133 3.81528 5 3.93698V10.038ZM4.5 2.99998C4.76522 2.99998 5.01957 2.89462 5.20711 2.70709C5.39465 2.51955 5.5 2.2652 5.5 1.99998C5.5 1.73476 5.39465 1.48041 5.20711 1.29287C5.01957 1.10534 4.76522 0.99998 4.5 0.99998C4.23479 0.99998 3.98043 1.10534 3.7929 1.29287C3.60536 1.48041 3.5 1.73476 3.5 1.99998C3.5 2.2652 3.60536 2.51955 3.7929 2.70709C3.98043 2.89462 4.23479 2.99998 4.5 2.99998ZM4.5 15C4.76522 15 5.01957 14.8946 5.20711 14.7071C5.39465 14.5196 5.5 14.2652 5.5 14C5.5 13.7348 5.39465 13.4804 5.20711 13.2929C5.01957 13.1053 4.76522 13 4.5 13C4.23479 13 3.98043 13.1053 3.7929 13.2929C3.60536 13.4804 3.5 13.7348 3.5 14C3.5 14.2652 3.60536 14.5196 3.7929 14.7071C3.98043 14.8946 4.23479 15 4.5 15ZM12.5 5.99998C12.7652 5.99998 13.0196 5.89462 13.2071 5.70709C13.3946 5.51955 13.5 5.2652 13.5 4.99998C13.5 4.73476 13.3946 4.48041 13.2071 4.29287C13.0196 4.10534 12.7652 3.99998 12.5 3.99998C12.2348 3.99998 11.9804 4.10534 11.7929 4.29287C11.6054 4.48041 11.5 4.73476 11.5 4.99998C11.5 5.2652 11.6054 5.51955 11.7929 5.70709C11.9804 5.89462 12.2348 5.99998 12.5 5.99998Z"
                        fill="#00B8AE"
                      />
                    </svg>
                    <p className="text-[14px] font-bold">
                      {story.branchesCount ?? 0} Branches
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        className="flex flex-col gap-[60px] mt-[90px] w-full items-center h-fit bg-[#FAFAFB]"
        style={{
          paddingRight: "57px",
          paddingLeft: "120px",
          paddingTop: "50px",
          paddingBottom: "50px",
        }}
      >
        <p className="font-bold text-[36px]">Community Highlights</p>
        <div className="flex flex-row w-full gap-x-40">
          <div className="flex flex-row space-x-12 w-full justify-between">
            <div className="px-10 py-[220px] border border-[#F3F3F3] rounded-sm flex flex-col items-center justify-center bg-white">
              <svg
                width="33"
                height="33"
                viewBox="0 0 33 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.60925 17.2837C7.7783 17.2116 7.9601 17.1741 8.14389 17.1734C8.32768 17.1728 8.50975 17.209 8.67931 17.2799C8.84888 17.3508 9.00251 17.455 9.13112 17.5863C9.25974 17.7176 9.36072 17.8733 9.42811 18.0443C9.4955 18.2153 9.52792 18.3981 9.52346 18.5818C9.519 18.7656 9.47774 18.9465 9.40214 19.1141C9.32653 19.2816 9.21811 19.4323 9.08327 19.5572C8.94844 19.6821 8.78993 19.7787 8.61713 19.8413C7.6981 20.2036 6.90935 20.834 6.35343 21.6506C5.79751 22.4672 5.50015 23.4321 5.5 24.42V26.8125C5.5 27.1772 5.64487 27.5269 5.90273 27.7848C6.16059 28.0426 6.51033 28.1875 6.875 28.1875H17.875C18.2397 28.1875 18.5894 28.0426 18.8473 27.7848C19.1051 27.5269 19.25 27.1772 19.25 26.8125V24.5479C19.2498 23.5284 18.9399 22.533 18.3614 21.6935C17.7829 20.854 16.9631 20.21 16.0105 19.8468C15.8366 19.7864 15.6766 19.6918 15.54 19.5684C15.4034 19.4451 15.2929 19.2956 15.2151 19.1288C15.1373 18.962 15.0938 18.7813 15.0872 18.5973C15.0805 18.4134 15.1109 18.23 15.1765 18.058C15.242 17.886 15.3414 17.729 15.4688 17.5961C15.5962 17.4633 15.7489 17.3573 15.918 17.2846C16.0871 17.2119 16.2691 17.1739 16.4531 17.1728C16.6372 17.1717 16.8196 17.2075 16.9895 17.2782C18.4627 17.8398 19.7307 18.8356 20.6254 20.1338C21.5201 21.4319 21.9995 22.9712 22 24.5479V26.8125C22 27.9065 21.5654 28.9557 20.7918 29.7293C20.0182 30.5029 18.969 30.9375 17.875 30.9375H6.875C5.78098 30.9375 4.73177 30.5029 3.95818 29.7293C3.1846 28.9557 2.75 27.9065 2.75 26.8125L2.75 24.42C2.75038 22.8803 3.21402 21.3763 4.08063 20.1035C4.94725 18.8308 6.17675 17.8483 7.60925 17.2837ZM12.375 3.4375C13.8337 3.4375 15.2326 4.01696 16.2641 5.04841C17.2955 6.07986 17.875 7.47881 17.875 8.9375V11.6875C17.875 13.1462 17.2955 14.5451 16.2641 15.5766C15.2326 16.608 13.8337 17.1875 12.375 17.1875C10.9163 17.1875 9.51736 16.608 8.48591 15.5766C7.45446 14.5451 6.875 13.1462 6.875 11.6875V8.9375C6.875 7.47881 7.45446 6.07986 8.48591 5.04841C9.51736 4.01696 10.9163 3.4375 12.375 3.4375ZM12.375 6.1875C11.6457 6.1875 10.9462 6.47723 10.4305 6.99296C9.91473 7.50868 9.625 8.20815 9.625 8.9375V11.6875C9.625 12.4168 9.91473 13.1163 10.4305 13.632C10.9462 14.1478 11.6457 14.4375 12.375 14.4375C13.1043 14.4375 13.8038 14.1478 14.3195 13.632C14.8353 13.1163 15.125 12.4168 15.125 11.6875V8.9375C15.125 8.20815 14.8353 7.50868 14.3195 6.99296C13.8038 6.47723 13.1043 6.1875 12.375 6.1875ZM24.75 29.5625C24.3853 29.5625 24.0356 29.4176 23.7777 29.1598C23.5199 28.9019 23.375 28.5522 23.375 28.1875C23.375 27.8228 23.5199 27.4731 23.7777 27.2152C24.0356 26.9574 24.3853 26.8125 24.75 26.8125H26.125C26.4897 26.8125 26.8394 26.6676 27.0973 26.4098C27.3551 26.1519 27.5 25.8022 27.5 25.4375V22.9102C27.4993 21.933 27.1915 20.9807 26.62 20.1879C26.0486 19.3951 25.2424 18.802 24.3155 18.4924C24.1441 18.4353 23.9857 18.3451 23.8492 18.2268C23.7127 18.1085 23.6009 17.9645 23.5201 17.8029C23.4393 17.6414 23.391 17.4656 23.3782 17.2854C23.3653 17.1053 23.3881 16.9244 23.4451 16.753C23.5022 16.5816 23.5924 16.4232 23.7107 16.2867C23.829 16.1502 23.973 16.0384 24.1346 15.9576C24.2961 15.8768 24.4719 15.8285 24.6521 15.8157C24.8322 15.8028 25.0131 15.8256 25.1845 15.8826C26.6592 16.3747 27.9419 17.3181 28.851 18.5793C29.76 19.8405 30.2495 21.3556 30.25 22.9102V25.4375C30.25 26.5315 29.8154 27.5807 29.0418 28.3543C28.2682 29.1279 27.219 29.5625 26.125 29.5625H24.75ZM20.625 4.8125C20.2603 4.8125 19.9106 4.66763 19.6527 4.40977C19.3949 4.15191 19.25 3.80217 19.25 3.4375C19.25 3.07283 19.3949 2.72309 19.6527 2.46523C19.9106 2.20737 20.2603 2.0625 20.625 2.0625C22.0837 2.0625 23.4826 2.64196 24.5141 3.67341C25.5455 4.70486 26.125 6.10381 26.125 7.5625V10.3125C26.125 11.7712 25.5455 13.1701 24.5141 14.2016C23.4826 15.233 22.0837 15.8125 20.625 15.8125C20.2603 15.8125 19.9106 15.6676 19.6527 15.4098C19.3949 15.1519 19.25 14.8022 19.25 14.4375C19.25 14.0728 19.3949 13.7231 19.6527 13.4652C19.9106 13.2074 20.2603 13.0625 20.625 13.0625C21.3543 13.0625 22.0538 12.7728 22.5695 12.257C23.0853 11.7413 23.375 11.0418 23.375 10.3125V7.5625C23.375 6.83315 23.0853 6.13368 22.5695 5.61796C22.0538 5.10223 21.3543 4.8125 20.625 4.8125Z"
                  fill="#00B8AE"
                />
              </svg>
              <p>50K+</p>
              <p>Engaged </p>
              <p>Members</p>
            </div>
            <div className="px-10 py-[220px] border border-[#F3F3F3] rounded-sm flex flex-col items-center justify-center bg-white">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.7992 22.4334L15.9992 19.9001L20.1992 22.4667L19.0992 17.6667L22.7992 14.4667L17.9325 14.0334L15.9992 9.50005L14.0659 14L9.19921 14.4334L12.8992 17.6667L11.7992 22.4334ZM9.76587 25.2307L11.4192 18.1467L5.92188 13.384L13.1632 12.7574L15.9992 6.07605L18.8352 12.7561L26.0752 13.3827L20.5779 18.1454L22.2325 25.2294L15.9992 21.4694L9.76587 25.2307Z"
                  fill="#00B8AE"
                />
              </svg>

              <p>50K+</p>
              <p>Engaged </p>
              <p>Members</p>
            </div>
            <div className="px-10 py-[220px] border border-[#F3F3F3] rounded-sm flex flex-col items-center justify-center bg-white">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.75001 17.5665C9.32037 16.9846 10.0011 16.5223 10.7523 16.2068C11.5036 15.8913 12.3102 15.7288 13.125 15.729H16.625C17.6523 15.7293 18.647 15.3681 19.4348 14.7087C20.2225 14.0492 20.7531 13.1336 20.9335 12.1222C20.1135 11.8938 19.4048 11.3744 18.9401 10.6612C18.4754 9.94794 18.2866 9.08982 18.409 8.24742C18.5313 7.40501 18.9565 6.63608 19.6049 6.08455C20.2533 5.53302 21.0805 5.2367 21.9316 5.25106C22.7828 5.26541 23.5995 5.58946 24.2289 6.16254C24.8584 6.73562 25.2574 7.51845 25.3513 8.3645C25.4452 9.21055 25.2275 10.0618 24.739 10.759C24.2506 11.4561 23.5248 11.9513 22.6975 12.152C22.5035 13.6252 21.7805 14.9776 20.6634 15.9573C19.5462 16.937 18.1109 17.4772 16.625 17.4772H13.125C12.0904 17.4769 11.0892 17.8433 10.2991 18.5113C9.50902 19.1793 8.98125 20.1057 8.80951 21.126C9.62792 21.3526 10.336 21.8691 10.8018 22.5792C11.2676 23.2893 11.4594 24.1445 11.3414 24.9855C11.2233 25.8264 10.8035 26.5958 10.1603 27.1502C9.51698 27.7046 8.69406 28.0063 7.84487 27.9989C6.99567 27.9915 6.17813 27.6756 5.5446 27.1101C4.91106 26.5445 4.50474 25.768 4.40136 24.9251C4.29798 24.0821 4.50459 23.2304 4.98269 22.5285C5.4608 21.8267 6.17777 21.3226 7.00001 21.1102V6.88972C6.17518 6.67675 5.45634 6.17026 4.97823 5.46521C4.50012 4.76015 4.29556 3.90493 4.4029 3.05984C4.51024 2.21475 4.92211 1.43782 5.5613 0.874683C6.2005 0.311543 7.02313 0.000854492 7.87501 0.000854492C8.72688 0.000854492 9.54952 0.311543 10.1887 0.874683C10.8279 1.43782 11.2398 2.21475 11.3471 3.05984C11.4545 3.90493 11.2499 4.76015 10.7718 5.46521C10.2937 6.17026 9.57483 6.67675 8.75001 6.88972V17.5665ZM7.87501 5.24997C8.33914 5.24997 8.78426 5.06559 9.11244 4.7374C9.44063 4.40921 9.62501 3.96409 9.62501 3.49997C9.62501 3.03584 9.44063 2.59072 9.11244 2.26253C8.78426 1.93434 8.33914 1.74997 7.87501 1.74997C7.41088 1.74997 6.96576 1.93434 6.63757 2.26253C6.30938 2.59072 6.12501 3.03584 6.12501 3.49997C6.12501 3.96409 6.30938 4.40921 6.63757 4.7374C6.96576 5.06559 7.41088 5.24997 7.87501 5.24997ZM7.87501 26.25C8.33914 26.25 8.78426 26.0656 9.11244 25.7374C9.44063 25.4092 9.62501 24.9641 9.62501 24.5C9.62501 24.0358 9.44063 23.5907 9.11244 23.2625C8.78426 22.9343 8.33914 22.75 7.87501 22.75C7.41088 22.75 6.96576 22.9343 6.63757 23.2625C6.30938 23.5907 6.12501 24.0358 6.12501 24.5C6.12501 24.9641 6.30938 25.4092 6.63757 25.7374C6.96576 26.0656 7.41088 26.25 7.87501 26.25ZM21.875 10.5C22.3391 10.5 22.7843 10.3156 23.1124 9.9874C23.4406 9.65921 23.625 9.21409 23.625 8.74997C23.625 8.28584 23.4406 7.84072 23.1124 7.51253C22.7843 7.18434 22.3391 6.99997 21.875 6.99997C21.4109 6.99997 20.9658 7.18434 20.6376 7.51253C20.3094 7.84072 20.125 8.28584 20.125 8.74997C20.125 9.21409 20.3094 9.65921 20.6376 9.9874C20.9658 10.3156 21.4109 10.5 21.875 10.5Z"
                  fill="#00B8AE"
                />
              </svg>
              <p>50K+</p>
              <p>Engaged </p>
              <p>Members</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {/* Top Writers */}
            <div
              className="flex flex-col px-2 py-2 bg-white border rounded-sm gap-[26px]"
              style={{
                width: "592px",
                height: "282px",
                borderColor: "#F3F3F3",
                paddingRight: "20px",
                paddingLeft: "42px",
                paddingTop: "32px",
                paddingBottom: "32px",
              }}
            >
              <p className="text-[24px] font-semibold">Top Writers</p>
              <div className="flex flex-col gap-4 w-full">
                {topWriters.map((w, i) => (
                  <div
                    key={i}
                    className="flex flex-row justify-between w-full items-center"
                  >
                    <div className="flex flex-row space-x-3 items-center">
                      {/* ✅ Real profile picture or initial fallback */}
                      {w.profilePicture ? (
                        <img
                          src={w.profilePicture}
                          alt={w.writer}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#00B8AE] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {w.writer.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex flex-col gap-0.5">
                        <p className="font-bold text-[16px]">{w.writer}</p>
                        <div className="flex flex-row gap-0.5 text-[14px] font-bold text-[#837E7E]">
                          <p>{w.storiesCount}</p>
                          <p>{w.storiesCount === 1 ? "Story" : "Stories"}</p>
                        </div>
                      </div>
                    </div>
                    {/* Your own icon goes here */}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Stories */}
            <div
              className="flex flex-col px-2 py-2 bg-white border rounded-sm gap-[26px]"
              style={{
                width: "592px",
                height: "282px",
                borderColor: "#F3F3F3",
                paddingRight: "20px",
                paddingLeft: "42px",
                paddingTop: "32px",
                paddingBottom: "32px",
              }}
            >
              <p className="text-[24px] font-semibold">Top Stories</p>
              <div className="flex flex-col gap-4 w-full">
                {topStories.map((story, i) => (
                  <div
                    key={story._id}
                    className="flex flex-row gap-5 w-full cursor-pointer"
                    onClick={() =>
                      router.push(`/Users/StoryPreview?id=${story._id}`)
                    }
                  >
                    {/* Cover image */}
                    <img
                      src={`${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`}
                      alt={story.title}
                      className="w-12 h-16 object-cover rounded-md flex-shrink-0"
                    />

                    <div className="flex flex-row justify-between w-full items-center">
                      <section className="flex flex-col gap-1">
                        <p className="font-bold text-[16px] line-clamp-1">
                          {story.title}
                        </p>
                        <p className="font-regular text-[10px]">
                          by {story.author.username}
                        </p>
                        <p className="font-medium text-[10px] text-[#00B8AE]">
                          {story.branchesCount ?? 0} Branches
                        </p>
                      </section>
                      {/* Your own icon goes here */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
