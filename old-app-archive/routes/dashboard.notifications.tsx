import { useEffect, useMemo, useState } from "react";
import {
  useLoaderData,
  useFetcher,
  useSearchParams,
  useRevalidator,
} from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Check,
  Trash2,
  Archive,
  ArchiveRestore,
  X,
  AtSign,
  AlertTriangle,
  Rocket,
  CreditCard,
  Info,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Route } from "./+types/dashboard.notifications";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { z } from "zod";
import { apiFetch } from "~/lib/http.server";
import { useAuth } from "~/hooks/useAuth";
import { useNotificationSocket } from "~/hooks/useNotificationSocket";


// ── Types ────────────────────────────────────────────────────────────────────

interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  archived: boolean;
  created_at: string;
}

const ViewFilterSchema = z.enum([
  "active",
  "unread",
  "archived",
]);

type ViewFilter = z.infer<typeof ViewFilterSchema>;


// ── Request helpers ──────────────────────────────────────────────────────────

function forwardedHeaders(request: Request): HeadersInit {
  const cookie = request.headers.get("cookie");

  return cookie ? { cookie } : {};
}


// ── Loader / Action ──────────────────────────────────────────────────────────

export async function loader({
  request,
}: Route.LoaderArgs) {
  const url = new URL(request.url);

  const view =
    ViewFilterSchema.catch("active").parse(
      url.searchParams.get("view"),
    ) ?? "active";

  const res = await apiFetch(
    `/api/notifications?archived=${view === "archived"}&unread_only=${view === "unread"}&limit=200`,
    {},
    request,
  );

  if (!res.ok) {
    throw new Response(
      "Failed to load notifications",
      {
        status: res.status,
      },
    );
  }

  const notifications: NotificationRecord[] =
    await res.json();

  return {
    notifications,
    view,
  };
}


export async function action({
  request,
}: Route.ActionArgs) {
  const formData = await request.formData();

  const intent = formData.get("intent");

  switch (intent) {
    case "mark-read": {
      const id = formData.get("id");

      await apiFetch(
        `/api/notifications/${id}/read`,
        {
          method: "POST",
        },
        request,
      );

      return {
        ok: true,
      };
    }

    case "mark-all-read": {
      await apiFetch(
        "/api/notifications/read-all",
        {
          method: "POST",
        },
        request,
      );

      return {
        ok: true,
      };
    }

    case "archive": {
      const id = formData.get("id");

      await apiFetch(
        `/api/notifications/${id}/archive`,
        {
          method: "POST",
        },
        request,
      );

      return {
        ok: true,
      };
    }

    case "unarchive": {
      const id = formData.get("id");

      await apiFetch(
        `/api/notifications/${id}/unarchive`,
        {
          method: "POST",
        },
        request,
      );

      return {
        ok: true,
      };
    }

    case "delete": {
      const id = formData.get("id");

      await apiFetch(
        `/api/notifications/${id}`,
        {
          method: "DELETE",
        },
        request,
      );

      return {
        ok: true,
      };
    }

    case "bulk": {
      const ids = JSON.parse(
        String(formData.get("ids")),
      );

      const bulkAction = String(
        formData.get("bulkAction"),
      );

      await apiFetch(
        "/api/notifications/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            ids,
            action: bulkAction,
          }),
        },
        request,
      );

      return {
        ok: true,
      };
    }

    default:
      return {
        ok: false,
      };
  }
}


// ── Presentation helpers ────────────────────────────────────────────────────

const TYPE_ICON: Record<string, LucideIcon> = {
  info: Info,
  alert: AlertTriangle,
  mention: AtSign,
  system: Rocket,
  billing: CreditCard,
  message: MessageSquare,
  invite: UserPlus,
};

const iconFor = (type: string) =>
  TYPE_ICON[type] ?? Bell;


function formatTime(iso: string): string {
  const diffMs =
    Date.now() - new Date(iso).getTime();

  const mins = Math.floor(
    diffMs / 60000,
  );

  if (mins < 1) {
    return "just now";
  }

  if (mins < 60) {
    return `${mins}m ago`;
  }

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) {
    return `${hrs}h ago`;
  }

  return new Date(iso).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    },
  );
}


function groupByDate(
  notifications: NotificationRecord[],
) {
  const todayStr =
    new Date().toDateString();

  const yesterdayStr =
    new Date(
      Date.now() - 86_400_000,
    ).toDateString();

  const buckets = new Map<
    string,
    NotificationRecord[]
  >();

  for (const notification of notifications) {
    const date =
      new Date(
        notification.created_at,
      ).toDateString();

    const label =
      date === todayStr
        ? "Today"
        : date === yesterdayStr
          ? "Yesterday"
          : "Earlier";

    if (!buckets.has(label)) {
      buckets.set(label, []);
    }

    buckets
      .get(label)!
      .push(notification);
  }

  return [
    "Today",
    "Yesterday",
    "Earlier",
  ]
    .filter((label) =>
      buckets.has(label),
    )
    .map((label) => ({
      label,
      items: buckets.get(label)!,
    }));
}


// ── Checkbox ─────────────────────────────────────────────────────────────────

function RowCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={cn(
        "size-4 rounded border flex items-center justify-center shrink-0 transition-colors",
        checked
          ? "bg-indigo-600 border-indigo-600"
          : "border-border hover:border-indigo-400",
      )}
    >
      {checked && (
        <Check
          size={11}
          className="text-white"
          strokeWidth={3}
        />
      )}
    </button>
  );
}


// ── View tabs ────────────────────────────────────────────────────────────────

function ViewTabs({
  value,
  onChange,
}: {
  value: ViewFilter;
  onChange: (value: ViewFilter) => void;
}) {
  const options: {
    value: ViewFilter;
    label: string;
  }[] = [
    {
      value: "active",
      label: "All",
    },
    {
      value: "unread",
      label: "Unread",
    },
    {
      value: "archived",
      label: "Archived",
    },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-black/5 dark:bg-white/5 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() =>
            onChange(option.value)
          }
          className={cn(
            "relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            value === option.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {value === option.value && (
            <motion.div
              layoutId="notif-view-tab-bg"
              className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-md shadow-sm"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 32,
              }}
            />
          )}

          <span className="relative">
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}


// ── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const {
    notifications: loaded,
    view,
  } = useLoaderData<typeof loader>();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const fetcher = useFetcher();

  const revalidator =
    useRevalidator();

  const { token } = useAuth();

  const [
    notifications,
    setNotifications,
  ] = useState(loaded);

  const [
    selected,
    setSelected,
  ] = useState<Set<string>>(
    new Set(),
  );

  const [
    activeNotification,
    setActiveNotification,
  ] =
    useState<NotificationRecord | null>(
      null,
    );


  /*
   * Keep local state synchronized with
   * the loader whenever the loader
   * is revalidated.
   */
  useEffect(() => {
    setNotifications(loaded);
    setSelected(new Set());
  }, [loaded]);


  /*
   * Real-time notification WebSocket.
   *
   * The WebSocket is enabled only when
   * the user has an authentication token.
   *
   * When the backend broadcasts a new
   * notification, revalidate the loader.
   *
   * This keeps the backend as the
   * authoritative source of notification
   * data.
   */
  const {
    status: socketStatus,
  } = useNotificationSocket({
    enabled: Boolean(token),
    token,

    onNotification: () => {
      revalidator.revalidate();
    },
  });


  const groups = useMemo(
    () => groupByDate(notifications),
    [notifications],
  );

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read,
    ).length;

  const selectionMode =
    selected.size > 0;


  const setView = (
    next: ViewFilter,
  ) => {
    setSearchParams(
      next === "active"
        ? {}
        : {
            view: next,
          },
    );
  };


  const toggleSelected = (
    id: string,
  ) => {
    setSelected((previous) => {
      const next = new Set(
        previous,
      );

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };


  const submitIntent = (
    intent: string,
    extra: Record<
      string,
      string
    > = {},
  ) => {
    fetcher.submit(
      {
        intent,
        ...extra,
      },
      {
        method: "post",
      },
    );
  };


  const openNotification = (
    notification: NotificationRecord,
  ) => {
    setActiveNotification(
      notification,
    );

    if (!notification.read) {
      setNotifications(
        (previous) =>
          previous.map(
            (item) =>
              item.id ===
                notification.id
                ? {
                    ...item,
                    read: true,
                  }
                : item,
          ),
      );

      submitIntent(
        "mark-read",
        {
          id: notification.id,
        },
      );
    }
  };


  const archiveOne = (
    id: string,
  ) => {
    setNotifications(
      (previous) =>
        previous.filter(
          (notification) =>
            notification.id !== id,
        ),
    );

    submitIntent(
      "archive",
      {
        id,
      },
    );
  };


  const unarchiveOne = (
    id: string,
  ) => {
    setNotifications(
      (previous) =>
        previous.filter(
          (notification) =>
            notification.id !== id,
        ),
    );

    submitIntent(
      "unarchive",
      {
        id,
      },
    );
  };


  const deleteOne = (
    id: string,
  ) => {
    setNotifications(
      (previous) =>
        previous.filter(
          (notification) =>
            notification.id !== id,
        ),
    );

    submitIntent(
      "delete",
      {
        id,
      },
    );
  };


  const markAllRead = () => {
    setNotifications(
      (previous) =>
        previous.map(
          (notification) => ({
            ...notification,
            read: true,
          }),
        ),
    );

    submitIntent(
      "mark-all-read",
    );
  };


  const bulkRun = (
    bulkAction:
      | "read"
      | "archive"
      | "unarchive"
      | "delete",
  ) => {
    const ids =
      Array.from(selected);

    setNotifications(
      (previous) =>
        previous.filter(
          (notification) =>
            !selected.has(
              notification.id,
            ),
        ),
    );

    fetcher.submit(
      {
        intent: "bulk",
        ids: JSON.stringify(ids),
        bulkAction,
      },
      {
        method: "post",
      },
    );

    setSelected(new Set());
  };


  return (
    <div className="w-full h-full flex flex-col py-8 px-6 gap-5 relative">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Notifications
            </h1>

            {token && (
              <span
                title={`Notification socket: ${socketStatus}`}
                className={cn(
                  "size-2 rounded-full",
                  socketStatus ===
                    "connected"
                    ? "bg-green-500"
                    : socketStatus ===
                        "connecting"
                      ? "bg-yellow-500"
                      : socketStatus ===
                          "error"
                        ? "bg-red-500"
                        : "bg-muted-foreground/40",
                )}
              />
            )}
          </div>

          <p className="text-muted-foreground text-sm">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ViewTabs
            value={view}
            onChange={setView}
          />

          {view !== "archived" &&
            unreadCount > 0 && (
              <Button
                onClick={markAllRead}
                variant="outline"
                className="rounded-lg text-xs h-8"
              >
                Mark all read
              </Button>
            )}
        </div>
      </div>


      {/* Notifications */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">

        {notifications.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4 m-auto gap-2">
            <Bell
              size={20}
              className="text-muted-foreground/50"
            />

            <span className="text-sm text-muted-foreground">
              {view === "archived"
                ? "Nothing archived."
                : "No notifications yet."}
            </span>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 pb-16">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border/30">
                  {group.label}
                </div>

                <AnimatePresence initial={false}>
                  {group.items.map(
                    (notification) => {
                      const Icon =
                        iconFor(
                          notification.type,
                        );

                      const isChecked =
                        selected.has(
                          notification.id,
                        );

                      return (
                        <motion.div
                          key={
                            notification.id
                          }
                          layout
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -24,
                            transition: {
                              duration: 0.15,
                            },
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                          onClick={() =>
                            openNotification(
                              notification,
                            )
                          }
                          className={cn(
                            "group flex items-start gap-3 px-4 py-3 border-b border-border/30 last:border-0 cursor-pointer transition-colors",
                            !notification.read &&
                              "bg-indigo-500/5",
                            isChecked &&
                              "bg-indigo-500/10",
                            "hover:bg-black/2 dark:hover:bg-white/2",
                          )}
                        >
                          <div className="pt-1">
                            <RowCheckbox
                              checked={
                                isChecked
                              }
                              onToggle={() =>
                                toggleSelected(
                                  notification.id,
                                )
                              }
                            />
                          </div>

                          <div className="mt-1 shrink-0 size-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                            <Icon
                              size={13}
                              className="text-muted-foreground"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {!notification.read && (
                                <span className="size-1.5 rounded-full bg-indigo-500 shrink-0" />
                              )}

                              <span className="text-sm font-medium truncate">
                                {
                                  notification.title
                                }
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {
                                notification.message
                              }
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap">
                              {formatTime(
                                notification.created_at,
                              )}
                            </span>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {notification.archived ? (
                                <button
                                  onClick={(
                                    event,
                                  ) => {
                                    event.stopPropagation();

                                    unarchiveOne(
                                      notification.id,
                                    );
                                  }}
                                  className="text-muted-foreground hover:text-foreground"
                                  title="Unarchive"
                                >
                                  <ArchiveRestore
                                    size={14}
                                  />
                                </button>
                              ) : (
                                <button
                                  onClick={(
                                    event,
                                  ) => {
                                    event.stopPropagation();

                                    archiveOne(
                                      notification.id,
                                    );
                                  }}
                                  className="text-muted-foreground hover:text-foreground"
                                  title="Archive"
                                >
                                  <Archive
                                    size={14}
                                  />
                                </button>
                              )}

                              <button
                                onClick={(
                                  event,
                                ) => {
                                  event.stopPropagation();

                                  deleteOne(
                                    notification.id,
                                  );
                                }}
                                className="text-muted-foreground hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2
                                  size={14}
                                />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    },
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Floating bulk-action bar */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 16,
            }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 30,
            }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-full border border-black/5 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-lg"
          >
            <span className="text-xs font-medium px-2">
              {selected.size} selected
            </span>

            <div className="h-4 w-px bg-border mx-1" />

            <Button
              size="sm"
              variant="ghost"
              className="h-7 rounded-full text-xs gap-1"
              onClick={() =>
                bulkRun("read")
              }
            >
              <Check size={13} />
              Read
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 rounded-full text-xs gap-1"
              onClick={() =>
                bulkRun("archive")
              }
            >
              <Archive size={13} />
              Archive
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 rounded-full text-xs gap-1 text-red-600 hover:text-red-600"
              onClick={() =>
                bulkRun("delete")
              }
            >
              <Trash2 size={13} />
              Delete
            </Button>

            <button
              onClick={() =>
                setSelected(new Set())
              }
              className="text-muted-foreground hover:text-foreground p-1.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Detail side view */}
      <Sheet
        open={
          activeNotification !== null
        }
        onOpenChange={(open) => {
          if (!open) {
            setActiveNotification(
              null,
            );
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md"
        >
          {activeNotification && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                    {(() => {
                      const Icon =
                        iconFor(
                          activeNotification.type,
                        );

                      return (
                        <Icon
                          size={15}
                          className="text-muted-foreground"
                        />
                      );
                    })()}
                  </div>

                  <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    {
                      activeNotification.type
                    }
                  </span>
                </div>

                <SheetTitle>
                  {
                    activeNotification.title
                  }
                </SheetTitle>

                <SheetDescription>
                  {formatTime(
                    activeNotification.created_at,
                  )}
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 py-2">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {
                    activeNotification.message
                  }
                </p>
              </div>

              <div className="mt-auto p-4 border-t border-border/50 flex items-center gap-2">
                {activeNotification.link && (
                  <Button
                    asChild
                    size="sm"
                    className="rounded-lg"
                  >
                    <a
                      href={
                        activeNotification.link
                      }
                    >
                      Open
                    </a>
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg gap-1.5"
                  onClick={() => {
                    archiveOne(
                      activeNotification.id,
                    );

                    setActiveNotification(
                      null,
                    );
                  }}
                >
                  <Archive size={13} />
                  Archive
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg gap-1.5 text-red-600 hover:text-red-600"
                  onClick={() => {
                    deleteOne(
                      activeNotification.id,
                    );

                    setActiveNotification(
                      null,
                    );
                  }}
                >
                  <Trash2 size={13} />
                  Delete
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
