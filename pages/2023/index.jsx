import React, { useEffect } from "react";
import { PageLayout } from "@/components/layouts/page";
import { PageContent } from "@/components/layouts/page-contents";
import Container from "@/components/layouts/container";
import { NavbarAgenda } from "@/components/layouts/navbar-agenda";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { SHWhite, JalaLogo } from "@/components/logo/shlogo";
import { useSession, signIn, signOut } from "next-auth/react";
import qs from "qs";
import { CommandLineIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Ticket } from "@/components/layouts/ticket";
import {
  TimeConverter,
  DateNumericConverter,
  DateMonthShortConverter,
} from "@/utils";

export default function SH2023() {
  const { data: session, status, loading } = useSession();

  const paramAccount = session?.user
    ? qs.stringify({
        filterByFormula: `email="${session?.user?.email}"`,
        maxRecords: 1,
      })
    : "";

  const {
    data: account,
    error: accountDataError,
    isLoading: accountDataLoading,
  } = useSWR(
    paramAccount
      ? `${process.env.NEXT_PUBLIC_AIRTABLE_URI}/2023_registration?${paramAccount}`
      : null,
    (url) =>
      fetcher(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_TOKEN}`,
        },
      })
  );

  const {
    data: events,
    error: eventDataError,
    isLoading: eventDataLoading,
  } = useSWR(
    `${process.env.NEXT_PUBLIC_AIRTABLE_URI}/events?sort%5B0%5D%5Bfield%5D=date`,
    (url) =>
      fetcher(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_TOKEN}`,
        },
      })
  );

  useEffect(() => {
    // if (account) {
    //   const ticket = document.getElementById("ticket");
    //   const { x, y, width, height } = ticket.getBoundingClientRect();
    //   const centerPoint = { x: x + width / 2, y: y + height / 2 };
    //   window.addEventListener("mousemove", (e) => {
    //     const degreeX = (e.clientY - centerPoint.y) * 0.008;
    //     const degreeY = (e.clientX - centerPoint.x) * -0.008;

    //     ticket.style.transform = `perspective(1000px) rotateX(${degreeX}deg) rotateY(${degreeY}deg)`;
    //   });
    // }
    if (
      !session &&
      status == "unauthenticated"
      // ||
      // account?.records?.length == 0
    ) {
      console.log("masuk");
      // router.push("/login");
      signIn();
    }
  }, [account, session, status]);

  // console.log(events);

  return (
    <PageLayout>
      <PageContent>
        <NavbarAgenda />
        <Container>
          {account?.records && session?.user && !loading && (
            <div className="flex flex-col">
              <Ticket account={account?.records[0]} session={session} />
              <div
                className="flex flex-col gap-4 py-20 scroll-mt-10 px-4 md:px-16"
                id="events"
              >
                <div className="text-4xl font-bold mx-auto">Events</div>
                <div className="flex flex-col flex-wrap justify-center gap-1 mx-auto py-6">
                  {events?.records ? (
                    events?.records?.map((event, i) => (
                      <div
                        key={i}
                        className="flex flex-row gap-4 p-4 items-center"
                      >
                        <div className="flex flex-col justify-center text-center p-2 bg-white text-slate-900 w-20 rounded-xl">
                          <div className="text-2xl font-bold">
                            {DateNumericConverter(event.fields.date)}
                          </div>
                          <div className="uppercase">
                            {DateMonthShortConverter(event.fields.date)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1  w-full">
                          <div className="text-lg font-semibold">
                            {event.fields.name}
                          </div>
                          <div className="text-xs">
                            {TimeConverter(event.fields.date)} &bull;{" "}
                            {event.fields.location}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              {/* <div>Agenda</div> */}
            </div>
          )}
        </Container>
      </PageContent>
    </PageLayout>
  );
}