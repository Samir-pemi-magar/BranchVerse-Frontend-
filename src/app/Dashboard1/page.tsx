import Footer from "@/src/component/Footer";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center bg-white px-[76px] w-full h-screen py-[110px]">
      <div className="flex items-center justify-between flex-row w-full px-[66px]">
        <div className="flex flex-col gap-[33px]">
          <p className="text-[60px] font-bold w-[461px] wrap-normal leading-[60px] tracking-[-1px]">
            BranchVerse: A New Era of Storytelling
          </p>
          <div className="flex gap-[22px] flex-col">
            <p className="font-bold text-[20px] w-[478px] text-[#837E7E] leading-7">
              Collaborate, create, and explore branching narratives. Dive into
              universes woven by a global community of writers and readers.
            </p>
            <div className="flex flex-row space-x-[18px]">
              <button className="font-bold text-[14px] border-2 border-[#00B8AE] bg-white hover:bg-[#00B8AE] hover:text-white w-[148px] h-11 rounded-md cursor-pointer transition duration-200">
                Start a Story
              </button>
              <button className="font-bold text-[14px] border-2 border-[#00B8AE] bg-white hover:bg-[#00B8AE] hover:text-white w-[148px] h-11 rounded-md cursor-pointer transition duration-200">
                Explore Stories
              </button>
            </div>
          </div>
        </div>
        <div>#image</div>
      </div>
      <div className="w-full bg-[#F9F9F9] flex flex-col gap-[60px] items-center pb-[23px] px-[76px] mt-[91px]">
        <p className="mt-[85px] font-bold text-[36px]">Feature Highlights</p>
        <div className="w-full flex flex-row space-x-[86px]">
          <div className="w-[216px] h-[234px] bg-white rounded-2xl border border-[#D5D1D1]"></div>
        </div>
      </div>
      <div className="mt-[91px] w-full flex flex-col items-center gap-[60px]">
        <p className="font-bold text-[36px]">Discover Stories</p>
        <div className="flex w-full px-[76px]">
          <div className="w-[378px] h-[232px] bg-red-50 rounded-2xl flex flex-col items-start justify-end pb-[15px]">
            <p className="ml-[15px] font-bold text-[18px] stroke-[1px] stroke-[#FFF2A7]">
              Title
            </p>
            <div className="ml-[15px]  rounded-2xl h-5 w-[82px] text-center items-center justify-center flex flex-col text-white bg-[#9C75DB] text-[10px] font-bold">
              <span className=" flex">24 Branches</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[91px] pb-[91px] w-full flex flex-col items-center gap-[60px] bg-[#E0FFFE]">
        <p className="font-bold text-[36px] mt-[85px]">Discover Stories</p>
        <div className="w-full flex flex-row px-[76px] justify-between">
          <div className="w-fit h-fit flex flex-col items-center">
            <div className="rounded-full h-[54px] w-[54px] flex items-center justify-center bg-[#00B8AE]">
              <p className="font-bold text-[24px]">1</p>
            </div>
            <svg
              width="62"
              height="50"
              viewBox="0 0 62 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mt-3"
            >
              <path
                d="M52.068 35.697C52.6699 35.1165 53.3852 34.8263 54.2139 34.8263C55.0426 34.8263 55.7569 35.1165 56.3568 35.697L61.0971 40.3405C61.699 40.9209 62 41.5981 62 42.372C62 43.1459 61.699 43.8231 61.0971 44.4036C60.4951 44.984 59.7929 45.2742 58.9903 45.2742C58.1877 45.2742 57.4854 44.984 56.8835 44.4036L52.068 39.8326C51.466 39.2522 51.1651 38.5634 51.1651 37.7663C51.1651 36.9691 51.466 36.2794 52.068 35.697ZM55.0777 0.870658C55.6796 1.4511 55.9806 2.14085 55.9806 2.93992C55.9806 3.73899 55.6796 4.42778 55.0777 5.00628L50.3374 9.57724C49.7354 10.1577 49.0211 10.4479 48.1945 10.4479C47.3678 10.4479 46.6525 10.1577 46.0485 9.57724C45.4446 8.9968 45.1436 8.30801 45.1456 7.51088C45.1476 6.71374 45.4486 6.02399 46.0485 5.44161L50.8641 0.870658C51.466 0.290219 52.1683 0 52.9709 0C53.7735 0 54.4757 0.290219 55.0777 0.870658ZM6.92234 0.870658C7.52428 0.290219 8.23959 0 9.06826 0C9.89693 0 10.6112 0.290219 11.2112 0.870658L15.9515 5.51417C16.5534 6.09461 16.8544 6.77179 16.8544 7.5457C16.8544 8.31962 16.5534 8.9968 15.9515 9.57724C15.3495 10.1577 14.6352 10.4479 13.8086 10.4479C12.9819 10.4479 12.2666 10.1577 11.6626 9.57724L6.92234 5.00628C6.3204 4.42585 6.01943 3.73706 6.01943 2.93992C6.01943 2.14279 6.3204 1.45303 6.92234 0.870658ZM9.93205 35.697C10.534 36.2774 10.835 36.9672 10.835 37.7663C10.835 38.5653 10.534 39.2541 9.93205 39.8326L5.19176 44.4036C4.58981 44.984 3.87551 45.2742 3.04884 45.2742C2.22218 45.2742 1.50687 44.984 0.902922 44.4036C0.298974 43.8231 -0.00199651 43.1343 9.96593e-06 42.3372C0.00201644 41.5401 0.302987 40.8503 0.902922 40.2679L5.71846 35.697C6.3204 35.1165 7.02266 34.8263 7.82525 34.8263C8.62784 34.8263 9.33011 35.1165 9.93205 35.697ZM21.5194 40.9935L31 35.4793L40.4806 41.066L37.9976 30.6181L46.3495 23.6529L35.3641 22.7097L31 12.8422L26.6359 22.6371L15.6505 23.5803L24.0024 30.6181L21.5194 40.9935ZM31 42.2995L18.5097 49.555C17.9579 49.8935 17.3811 50.0387 16.7791 49.9903C16.1772 49.9419 15.6505 49.7484 15.199 49.4099C14.7476 49.0713 14.3964 48.6485 14.1456 48.1416C13.8948 47.6347 13.8447 47.0658 13.9952 46.4351L17.3058 32.7222L6.24515 23.5078C5.74354 23.0724 5.43053 22.5762 5.30613 22.0189C5.18172 21.4617 5.21884 20.918 5.41748 20.3879C5.61613 19.8578 5.9171 19.4224 6.3204 19.0819C6.7237 18.7414 7.27548 18.5237 7.97574 18.4289L22.5728 17.1955L28.216 4.28074C28.4668 3.7003 28.8561 3.26497 29.3838 2.97475C29.9115 2.68453 30.4502 2.53942 31 2.53942C31.5498 2.53942 32.0885 2.68453 32.6162 2.97475C33.1439 3.26497 33.5332 3.7003 33.784 4.28074L39.4272 17.1955L54.0243 18.4289C54.7265 18.5257 55.2783 18.7433 55.6796 19.0819C56.0809 19.4205 56.3819 19.8558 56.5825 20.3879C56.7832 20.92 56.8213 21.4646 56.6969 22.0218C56.5725 22.5791 56.2585 23.0744 55.7549 23.5078L44.6942 32.7222L48.0049 46.4351C48.1553 47.0639 48.1052 47.6327 47.8544 48.1416C47.6036 48.6504 47.2524 49.0732 46.801 49.4099C46.3495 49.7465 45.8228 49.94 45.2209 49.9903C44.6189 50.0406 44.0421 49.8955 43.4903 49.555L31 42.2995Z"
                fill="#00B8AE"
              />
            </svg>
            <p className="font-bold text-[24px] mt-3">Start a Story</p>
            <p className=" w-[300px] font-bold text-[16px] text-center wrap-normal mt-4">
              Initiate your narrative with a compelling premise and Establish
              the Universe
            </p>
          </div>
          <div className="w-fit h-fit flex flex-col items-center">
            <div className="rounded-full h-[54px] w-[54px] flex items-center justify-center bg-[#00B8AE]">
              <p className="font-bold text-[24px]">2</p>
            </div>
            <svg
              width="54"
              height="50"
              viewBox="0 0 54 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mt-3"
            >
              <path
                d="M45 50C42.5 50 40.375 49.2708 38.625 47.8125C36.875 46.3542 36 44.5833 36 42.5C36 42.25 36.075 41.6667 36.225 40.75L15.15 30.5C14.35 31.125 13.425 31.615 12.375 31.97C11.325 32.325 10.2 32.5017 9 32.5C6.5 32.5 4.375 31.7708 2.625 30.3125C0.875 28.8542 0 27.0833 0 25C0 22.9167 0.875 21.1458 2.625 19.6875C4.375 18.2292 6.5 17.5 9 17.5C10.2 17.5 11.325 17.6775 12.375 18.0325C13.425 18.3875 14.35 18.8767 15.15 19.5L36.225 9.25C36.125 8.95833 36.063 8.6775 36.039 8.4075C36.015 8.1375 36.002 7.835 36 7.5C36 5.41667 36.875 3.64583 38.625 2.1875C40.375 0.729167 42.5 0 45 0C47.5 0 49.625 0.729167 51.375 2.1875C53.125 3.64583 54 5.41667 54 7.5C54 9.58333 53.125 11.3542 51.375 12.8125C49.625 14.2708 47.5 15 45 15C43.8 15 42.675 14.8225 41.625 14.4675C40.575 14.1125 39.65 13.6233 38.85 13L17.775 23.25C17.875 23.5417 17.938 23.8233 17.964 24.095C17.99 24.3667 18.002 24.6683 18 25C17.998 25.3317 17.986 25.6342 17.964 25.9075C17.942 26.1808 17.879 26.4617 17.775 26.75L38.85 37C39.65 36.375 40.575 35.8858 41.625 35.5325C42.675 35.1792 43.8 35.0017 45 35C47.5 35 49.625 35.7292 51.375 37.1875C53.125 38.6458 54 40.4167 54 42.5C54 44.5833 53.125 46.3542 51.375 47.8125C49.625 49.2708 47.5 50 45 50Z"
                fill="#00B8AE"
              />
            </svg>
            <p className="font-bold text-[24px] mt-3">Branch & Expand</p>
            <p className=" w-[300px] font-bold text-[16px] text-center wrap-normal mt-4">
              Invite others or contribute to existing stories by adding new
              branches and plot developments.
            </p>
          </div>
          <div className="w-fit h-fit flex flex-col items-center">
            <div className="rounded-full h-[54px] w-[54px] flex items-center justify-center bg-[#00B8AE]">
              <p className="font-bold text-[24px]">3</p>
            </div>
            <svg
              width="54"
              height="49"
              viewBox="0 0 54 49"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mt-3"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.7725 28.0443L12.8594 26.9724L12.9438 24.7939C13.156 19.6794 13.3785 14.3301 11.9159 14.2566C11.7842 14.2509 11.6524 14.2663 11.5284 14.3021C11.4043 14.3379 11.2906 14.3933 11.1939 14.4649C11.0973 14.5366 11.0197 14.623 10.9658 14.7191C10.9119 14.8152 10.8828 14.919 10.8803 15.0243C10.397 17.6745 8.12636 35.1597 11.2076 35.1597C12.256 35.1597 12.2713 34.9045 12.5526 30.9742L12.6497 29.6471C18.403 30.229 24.1998 30.4903 29.9992 30.4331C33.1367 30.5899 36.2454 29.8742 38.7967 28.4077C41.348 26.9411 43.1844 24.8143 43.9938 22.3888C44.6254 19.9081 44.7404 17.36 44.3339 14.8508C44.2775 14.6434 44.1242 14.4611 43.9052 14.3409C43.6863 14.2207 43.4181 14.1717 43.1555 14.204C42.8928 14.2364 42.6555 14.3475 42.492 14.5147C42.3285 14.6819 42.251 14.8927 42.2754 15.104C42.3307 17.3235 41.9845 19.5377 41.2475 21.6783C38.5626 27.9667 32.3567 27.9851 22.6682 28.0076C21.2413 28.0117 19.7378 28.0137 18.1601 28.0382C17.6385 28.0382 17.0606 28.0464 16.4623 28.0545C15.24 28.0709 13.9257 28.0892 12.7725 28.0443Z"
                fill="#00B8AE"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.1186 0.303643C10.3614 0.15726 8.58734 0.393669 6.98488 0.987757C5.38242 1.58184 4.01142 2.51142 3.01751 3.67775C2.02361 4.84407 1.44393 6.20357 1.34005 7.61185C1.23617 9.02012 1.61196 10.4246 2.42751 11.676C9.88636 22.5644 30.0332 11.5535 18.3015 2.72716C18.2862 2.73532 15.3021 0.569065 12.1186 0.303643ZM16.8159 3.89297C25.0572 11.088 10.2443 17.6133 5.24536 10.4346C2.22806 6.10415 8.7357 -0.490584 16.8159 3.89297ZM11.3797 33.7367C9.7049 33.5078 7.98428 33.6329 6.38878 34.0994C4.79329 34.566 3.37846 35.3577 2.28487 36.3961C1.19129 37.4344 0.457021 38.6832 0.155031 40.0183C-0.146959 41.3534 -0.00615918 42.7283 0.563441 44.0065C1.28898 45.2912 2.40407 46.4112 3.8079 47.2652C5.21172 48.1193 6.86001 48.6806 8.60374 48.8982C10.3475 49.1159 12.1316 48.9831 13.795 48.5119C15.4583 48.0407 16.9483 47.2458 18.1302 46.1993C19.4456 45.1671 20.3394 43.8413 20.6941 42.3962C21.0488 40.951 20.848 39.454 20.1178 38.1016C19.3877 36.7493 18.1625 35.6048 16.603 34.8185C15.0435 34.0322 13.2227 33.6409 11.3797 33.6959V33.7367ZM11.2723 35.3578C12.6 35.3643 13.8948 35.6886 14.9892 36.289C16.0836 36.8893 16.9272 37.738 17.4111 38.7252C17.8949 39.7125 17.9967 40.793 17.7033 41.827C17.4098 42.8609 16.7346 43.8008 15.765 44.5251C14.9228 45.2343 13.8785 45.7705 12.7208 46.0879C11.5632 46.4054 10.3267 46.4947 9.11652 46.3484C7.90635 46.202 6.75842 45.8242 5.7705 45.2473C4.78258 44.6703 3.98396 43.9112 3.44265 43.0347C3.04104 42.095 2.94472 41.0893 3.16272 40.1118C3.38072 39.1343 3.9059 38.2169 4.68907 37.4457C5.47224 36.6745 6.48776 36.0746 7.64051 35.7023C8.79326 35.33 10.0455 35.1974 11.2799 35.317L11.2723 35.3578ZM38.9725 0.558857C36.5394 1.30319 34.538 2.74111 33.355 4.59484C32.172 6.44858 31.8913 8.5866 32.5672 10.5959C33.4072 12.2053 34.8107 13.5871 36.6094 14.5758C38.4081 15.5644 40.5257 16.1178 42.7084 16.1698C44.0727 16.2936 45.4542 16.1949 46.7694 15.8799C48.0846 15.5648 49.306 15.0399 50.3596 14.3369C51.4133 13.6339 52.2773 12.7674 52.8993 11.79C53.5213 10.8126 53.8883 9.7445 53.9782 8.65049C54.0681 7.55647 53.879 6.45927 53.4223 5.42533C52.9656 4.39138 52.2508 3.44222 51.3212 2.63531C50.3916 1.82841 49.2666 1.18055 48.0142 0.73098C46.7619 0.28141 45.4083 0.0394813 44.0354 0.0198445C44.0354 0.0341365 41.4119 -0.186369 38.9725 0.558857ZM43.9229 1.68792C45.4117 1.63991 46.8821 1.96394 48.1292 2.61486C49.1495 3.24878 49.9559 4.07576 50.4753 5.02103C50.9948 5.96629 51.211 7.00002 51.1044 8.02876C50.9978 9.05751 50.5717 10.0488 49.8648 10.913C49.1578 11.7773 48.1922 12.4872 47.0553 12.9786C44.9703 13.7481 42.591 13.8359 40.426 13.2232C38.261 12.6105 36.4821 11.3458 35.4694 9.69961C35.0166 8.201 35.242 6.6228 36.1058 5.24409C36.9696 3.86538 38.4162 2.77498 40.1897 2.16568C40.5272 2.04931 41.9438 1.68792 43.9229 1.68792Z"
                fill="#00B8AE"
              />
            </svg>

            <p className="font-bold text-[24px] mt-3">Explore & Collaborate</p>
            <p className=" w-[300px] font-bold text-[16px] text-center wrap-normal mt-4">
              Navigate through branching paths, discover diverse outcomes, and
              connect with fellow creators.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-10 w-full items-center mt-[91px]">
        <div className="flex flex-col w-full items-center gap-10">
          <p className="font-bold text-[36px]">Join Our Thriving Community</p>
          <div className="flex flex-row space-x-20">
            <div className="flex flex-col gap-2 items-center ">
              <p className="font-bold text-[48px] text-[#00B8AE]">10K+</p>
              <p className="font-bold text-[18px] text-[#837E7E]">Writers</p>
            </div>
            <div className="flex flex-col gap-2 items-center ">
              <p className="font-bold text-[48px] text-[#00B8AE]">50K+</p>
              <p className="font-bold text-[18px] text-[#837E7E]">Stories</p>
            </div>
            <div className="flex flex-col gap-2 items-center ">
              <p className="font-bold text-[48px] text-[#00B8AE]">120K+</p>
              <p className="font-bold text-[18px] text-[#837E7E]">Readers</p>
            </div>
          </div>
        </div>
        <button className="w-[251px] h-[60px] rounded-[7px] bg-[#00B8AE] font-bold text-[18px] text-white">
          Join The Community
        </button>
      </div>
      <div className="mt-[91px]">
        <Footer />
      </div>
    </div>
  );
}
